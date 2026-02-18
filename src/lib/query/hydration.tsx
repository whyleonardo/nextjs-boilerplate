"use client";

import {
  HydrationBoundary,
  type HydrationBoundaryProps,
} from "@tanstack/react-query";

/**
 * Client-side wrapper for HydrationBoundary.
 * Use this in Server Components to pass prefetched query state
 * to the client without prop-drilling.
 *
 * Usage in a Server Component:
 *   const queryClient = getQueryClient();
 *   void queryClient.prefetchQuery(orpc.posts.list.queryOptions({ input: {} }));
 *   return (
 *     <HydrateClient state={dehydrate(queryClient)}>
 *       <Suspense fallback={<Skeleton />}>
 *         <ClientComponent />
 *       </Suspense>
 *     </HydrateClient>
 *   );
 */
export function HydrateClient(props: HydrationBoundaryProps) {
  return <HydrationBoundary {...props} />;
}
