import "server-only";
import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { verifyJWT } from "@/lib/auth";

/**
 * Context creation - called for each request
 * Uses React's cache() to ensure single context per request
 */
export const createTRPCContext = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let isAuthenticated = false;
  if (token) {
    const payload = await verifyJWT(token);
    isAuthenticated = payload?.authenticated ?? false;
  }

  return {
    isAuthenticated,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure - requires valid JWT auth
 * Throws UNAUTHORIZED if not authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.isAuthenticated) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({ ctx });
});
