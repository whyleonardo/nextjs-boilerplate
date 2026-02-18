import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { orpc } from "@/lib/orpc/client";
import { getQueryClient } from "@/lib/query/client";

export const todosCollection = createCollection(
    queryCollectionOptions({
        syncMode: "on-demand",
        queryKey: orpc.todo.list.queryKey(),
        queryFn: async () => await orpc.todo.list.call(),
        queryClient: getQueryClient(),
        getKey: (item) => item.id,
    }),
);
