import { ORPCError, os } from "@orpc/server";
import { headers } from "next/headers";
import { auth } from "@/server/auth";

export interface Context {
  userId?: string;
}

/** Base procedure — available to all (no auth required). */
export const publicProcedure = os.$context<Context>();

/**
 * Raw auth middleware function.
 *
 * Exported separately so it can be used with contract-first `implement()`,
 * where `.use()` expects a plain middleware rather than a procedure builder.
 */
export const authMiddleware = os.middleware(async ({ next }) => {
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
export const protectedProcedure = publicProcedure.use(authMiddleware);
