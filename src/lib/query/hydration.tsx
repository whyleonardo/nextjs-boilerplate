import {
  dehydrate,
  HydrationBoundary,
  type QueryClient,
} from "@tanstack/react-query";
import { cache } from "react";
import { createQueryClient } from "./client";

/**
 * Returns a request-scoped QueryClient singleton on the server.
 * React's `cache()` ensures one instance per request, not per call.
 *
 * Usage in a Server Component:
 *   const queryClient = getQueryClient();
 *   void queryClient.prefetchQuery(orpc.posts.list.queryOptions());
 *   return (
 *     <HydrateClient client={queryClient}>
 *       <Suspense fallback={<Skeleton />}>
 *         <ClientComponent />
 *       </Suspense>
 *     </HydrateClient>
 *   );
 */
export const getQueryClient = cache(createQueryClient);

export function HydrateClient(props: {
  children: React.ReactNode;
  client: QueryClient;
}) {
  return (
    <HydrationBoundary state={dehydrate(props.client)}>
      {props.children}
    </HydrationBoundary>
  );
}
