import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "@/server/rpc";

const link = new RPCLink({
  url: () =>
    `${
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.BETTER_AUTH_URL ?? "http://localhost:3000")
    }/api/rpc`,
  headers: async () => {
    if (typeof window !== "undefined") {
      return {};
    }
    const { headers } = await import("next/headers");
    return Object.fromEntries((await headers()).entries());
  },
});

export const client: RouterClient<AppRouter> = createORPCClient(link);
