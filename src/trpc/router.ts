import "server-only";
import { router } from "@/trpc/init";
import { headingRouter } from "@/trpc/routers/heading";

export const appRouter = router({
  heading: headingRouter,
  // Future routers: aboutMe, education, experience, skills, etc.
});

export type AppRouter = typeof appRouter;
