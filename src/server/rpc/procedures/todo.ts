/**
 * Todo procedure implementations.
 *
 * `implement(todoContract)` creates a type-safe implementer scoped to the
 * contract. Every handler is checked against the contract's input/output
 * schemas at compile time — if you add a field to TodoSchema but forget to
 * return it here, TypeScript will tell you immediately.
 */
import { implement } from "@orpc/server";
import { type Todo, todoContract } from "@/server/contracts/todo";
import { authMiddleware } from "../middleware";

const os = implement(todoContract);

/**
 * In-memory todo store — keyed by userId so each user sees only their own
 * todos. Resets on server restart (swap for Drizzle when you need persistence).
 */
const store = new Map<string, Todo[]>();

function getTodosForUser(userId: string): Todo[] {
  if (!store.has(userId)) {
    store.set(userId, []);
  }
  // biome-ignore lint/style/noNonNullAssertion: just set above
  return store.get(userId)!;
}

/**
 * list — GET /api/todos
 * Returns all todos belonging to the authenticated user.
 */
export const listTodos = os.list.use(authMiddleware).handler(({ context }) => {
  return getTodosForUser(context.userId);
});

/**
 * create — POST /api/todos
 * Creates a new todo for the authenticated user.
 * Input: { title: string }
 */
export const createTodo = os.create
  .use(authMiddleware)
  .handler(({ input, context }) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: input.title,
      completed: false,
      userId: context.userId,
      createdAt: new Date().toISOString(),
    };

    getTodosForUser(context.userId).push(todo);

    return todo;
  });
