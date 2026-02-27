import { inngest } from "./inngest";
import { loadGithubRepo } from "./loadGithubRepo";
import { summariseCode, generateEmbedding } from "./gemini";
import { pollCommits } from "./github";
import { prisma } from "./prisma";

export const indexGithubRepoFunction = inngest.createFunction(
  {
    id: "index-github-repo",
    retries: 0,
  },
  { event: "project/index.requested" },
  async ({ event, step }) => {
    const { projectId, githubUrl, githubToken, userId, fileCount } =
      event.data as {
        projectId: string;
        githubUrl: string;
        githubToken: string | null;
        userId: string;
        fileCount: number;
      };

    // Step 1: Load all files from GitHub
    const docs = await step.run("load-github-repo", async () => {
      const docs = await loadGithubRepo(githubUrl, githubToken || undefined);
      return docs.map((doc) => ({
        pageContent: doc.pageContent,
        source: doc.metadata.source,
      }));
    });

    // Step 2: Process each file individually (each step gets its own timeout/retry)
    let successCount = 0;
    let failCount = 0;

    for (const [index, doc] of docs.entries()) {
      const result = await step.run(
        `process-file-${index}`,
        async () => {
          try {
            const summary = await summariseCode({
              pageContent: doc.pageContent,
              metadata: { source: doc.source },
            } as any);

            const embedding = await generateEmbedding(summary);

            const sourceCodeEmbedding =
              await prisma.sourceCodeEmbedding.create({
                data: {
                  summary,
                  sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
                  fileName: doc.source,
                  projectId,
                },
              });

            const embeddingVector = `[${embedding.join(",")}]`;
            await prisma.$executeRaw`
              UPDATE "SourceCodeEmbedding"
              SET "summaryEmbedding" = ${embeddingVector}::vector
              WHERE "id" = ${sourceCodeEmbedding.id}
            `;

            return { success: true };
          } catch (error) {
            console.error(`Failed to process file ${doc.source}:`, error);
            return { success: false };
          }
        },
      );

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Step 3: Poll commits
    await step.run("poll-commits", async () => {
      await pollCommits(projectId);
    });

    // Step 4: Update project status
    await step.run("update-project-status", async () => {
      if (successCount === 0 && docs.length > 0) {
        // Total failure — refund credits
        await prisma.project.update({
          where: { id: projectId },
          data: { status: "FAILED" },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: fileCount } },
        });
      } else {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: "READY" },
        });
      }
    });

    return { successCount, failCount, total: docs.length };
  },
);

export const inngestFunctions = [indexGithubRepoFunction];
