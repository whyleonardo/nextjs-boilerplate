import { implement } from "@orpc/server";
import { todoContract } from "@/features/todo/contracts";
import { authMiddleware } from "@/server/rpc/middleware";

const os = implement(todoContract);

export const listTodos = os.use(authMiddleware).list.handler(() => {
    return [{ id: crypto.randomUUID(), title: "New Todo", completed: false }];
});
