import { ORPCError, os } from "@orpc/server";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export type Context = {
  userId?: string;
};

/** Base procedure — available to all (no auth required). */
export const publicProcedure = os.$context<Context>();

/** Auth middleware — validates session and injects userId into context. */
const authMiddleware = publicProcedure.use(async ({ context, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be signed in to perform this action.",
    });
  }

  return next({
    context: {
      userId: session.user.id,
      session,
    },
  });
});

/** Protected procedure — requires an authenticated session. */
export const protectedProcedure = authMiddleware;
