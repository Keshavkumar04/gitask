import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { projectRouter } from "./routers/project";

export const appRouter = createTRPCRouter({
  user: userRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
