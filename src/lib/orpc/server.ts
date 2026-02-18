import "server-only";
import { createRouterClient } from "@orpc/server";
import { router } from "@/server/rpc";
import { headers } from "next/headers";

/**
 * Server-side oRPC caller — use this in Server Components and Server Actions
 * to call procedures directly without an HTTP round-trip.
 */
export const serverClient = createRouterClient(router, {
  context: async () => ({ headers: await headers() }),
});
