import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "./client";

/**
 * TanStack Query utilities generated from the oRPC client.
 * Use `orpc.yourProcedure.queryOptions(...)` in Server Components for prefetching,
 * and `useQuery(orpc.yourProcedure.queryOptions(...))` in Client Components.
 */
export const orpc = createTanstackQueryUtils(client);
