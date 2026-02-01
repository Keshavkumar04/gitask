// server/api/routers/user.ts
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  // A simple query to get the current user's info
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      greeting: `Hello, ${ctx.user.name}!`,
      email: ctx.user.email,
      id: ctx.user.id,
    };
  }),
});
