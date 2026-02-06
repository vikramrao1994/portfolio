import "server-only";
import { router } from "@/trpc/init";
import { aboutMeRouter } from "@/trpc/routers/aboutMe";
import { headingRouter } from "@/trpc/routers/heading";

export const appRouter = router({
  heading: headingRouter,
  aboutMe: aboutMeRouter,
});

export type AppRouter = typeof appRouter;
