import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { serializer } from "@/lib/orpc/serializer";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid immediate refetch on mount after SSR hydration.
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // Include pending queries so streaming works correctly.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        serializeData(data) {
          const [json, meta] = serializer.serialize(data);
          return { json, meta };
        },
      },
      hydrate: {
        deserializeData(data) {
          return serializer.deserialize(data.json, data.meta);
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a singleton QueryClient for the browser.
 * On the server a new instance is created per request (via createQueryClient).
 */
export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a fresh client to avoid cross-request leaks.
    return createQueryClient();
  }
  // Browser: reuse a single instance so every consumer shares the same cache.
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
