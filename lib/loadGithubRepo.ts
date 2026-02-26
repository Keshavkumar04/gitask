import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { prisma } from "./prisma";
import { Octokit } from "octokit";

export const getFileCount = async (githubUrl: string, githubToken?: string) => {
  const octokit = new Octokit({ auth: githubToken });
  // githubUrl is already clean: "https://github.com/owner/repo"
  const [owner, repo] = githubUrl.replace("https://github.com/", "").split("/");

  const { data } = await octokit.rest.git.getTree({
    owner: owner!,
    repo: repo!,
    tree_sha: "main",
    recursive: "true",
  });

  const fileCount = data.tree.filter((item) => item.type === "blob").length;
  return fileCount;
};

export const checkCredits = async (
  githubUrl: string,
  userId: string,
  githubToken?: string,
) => {
  const fileCount = await getFileCount(githubUrl, githubToken);
  return fileCount;
};

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    // Fallback to environment variable if explicit token is not passed
    accessToken: githubToken || "",
    branch: "main",
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
      "node_modules/",
      "tsconfig.tsbuildinfo",
      ".DS_Store",
      ".git/",
      ".gitignore",
      "public/",
      ".github",
    ],
  });

  const docs = await loader.load();
  return docs.filter((doc) => {
    const source = doc.metadata.source;
    return (
      !source.startsWith("public/") &&
      !source.startsWith("node_modules/") &&
      !source.startsWith(".github/")
    );
  });
  // return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (item, index) => {
      // console.log(`Processing ${index + 1} of ${allEmbeddings.length}`);
      if (!item) return;

      try {
        // Step A: Create record without vector
        const sourceCodeEmbedding = await prisma.sourceCodeEmbedding.create({
          data: {
            summary: item.summary,
            sourceCode: item.sourceCode,
            fileName: item.fileName,
            projectId: projectId,
          },
        });

        const embeddingVector = `[${item.embedding.join(",")}]`;

        await prisma.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embeddingVector}::vector
          WHERE "id" = ${sourceCodeEmbedding.id}
        `;
      } catch (error) {
        console.error(`Failed to index file ${item.fileName}:`, error);
      }
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      try {
        const summary = await summariseCode(doc);
        const embedding = await generateEmbedding(summary);

        return {
          summary,
          embedding,
          sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
          fileName: doc.metadata.source,
        };
      } catch (error) {
        console.error(
          `Error processing document ${doc.metadata.source}:`,
          error,
        );
        return null;
      }
    }),
  );
};
