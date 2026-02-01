// server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth"; // Your Better Auth config
import { prisma } from "@/lib/prisma"; // Your Prisma Client
import { headers } from "next/headers";
import SuperJSON from "superjson"; // Ensure you install this: npm install superjson

// 1. CONTEXT: Runs for every request
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db: prisma,
    session,
    user: session?.user,
    ...opts,
  };
};

// 2. INITIALIZATION
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON, // Allows dates/Maps/Sets to work correctly
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && "zodError" in error.cause
            ? error.cause.zodError
            : null,
      },
    };
  },
});

// 3. EXPORTS: Reusable pieces
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected Procedure: Ensures user is logged in
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  });
});
