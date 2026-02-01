// server/api/routers/project.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";

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
      // Here we use Prisma (ctx.db) to save to the database
      const project = await ctx.db.project.create({
        data: {
          name: input.projectName,
          githubUrl: input.repoUrl,
          userToProjects: {
            create: {
              userId: ctx.user.id!,
            },
          },
          // Note: We aren't saving 'githubToken' to the DB in your schema yet,
          // but we can use it here later to fetch repo details if needed.
        },
      });
      await pollCommits(project.id);
      return project;
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.id, // Only projects where I am a member
          },
        },
        deletedAt: null, // Ignore deleted projects (if you implement soft delete)
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
});
