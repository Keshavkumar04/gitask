import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      greeting: `Hello, ${ctx.user.name}!`,
      email: ctx.user.email,
      id: ctx.user.id,
    };
  }),
});
