import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/loadGithubRepo";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        projectName: z.string().min(1),
        repoUrl: z.url(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cleanRepoUrl = input.repoUrl
        .replace(/\/$/, "") // Remove slash
        .replace(/\.git$/, ""); // remove .git

      const fileCount = await checkCredits(
        cleanRepoUrl,
        ctx.user.id!,
        input.githubToken,
      );
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { credits: true },
      });
      if (!user || user.credits < fileCount) {
        throw new Error("Not enough credits to index this repository");
      }

      // Deduct credits upfront
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { credits: { decrement: fileCount } },
      });

      const project = await ctx.db.project.create({
        data: {
          name: input.projectName,
          githubUrl: cleanRepoUrl,
          userToProjects: {
            create: {
              userId: ctx.user.id!,
            },
          },
          // Note: We aren't saving 'githubToken' to the DB in your schema yet,
          // but we can use it here later to fetch repo details if needed.
        },
      });
      try {
        await indexGithubRepo(project.id, cleanRepoUrl, input.githubToken);
        await pollCommits(project.id);
        return project;
      } catch (error) {
        // If indexing fails, delete the project and refund credits
        await ctx.db.project.delete({
          where: { id: project.id },
        });
        await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: { credits: { increment: fileCount } },
        });

        throw error;
      }
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.id,
          },
        },
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      pollCommits(input.projectId).then().catch(console.error);
      return await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });
    }),
  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.id!,
        },
      });
    }),
  getQuestions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });
    }),
  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
      });
    }),
  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({
        where: { id: input.projectId },
        data: { deletedAt: new Date() },
      });
    }),
  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { credits: true },
    });
  }),
  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.stripeTransaction.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),
  checkCredits: protectedProcedure
    .input(
      z.object({
        githubUrl: z.url(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cleanUrl = input.githubUrl.replace(/\/$/, "").replace(/\.git$/, "");
      const fileCount = await checkCredits(
        cleanUrl,
        ctx.user.id!,
        input.githubToken,
      );
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { credits: true },
      });
      const userCredits = user?.credits ?? 0;
      return { fileCount, userCredits };
    }),
});
