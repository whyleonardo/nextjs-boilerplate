import { createTodo, listTodos } from "./procedures/todo";

export const router = {
  todo: {
    list: listTodos,
    create: createTodo,
  },
};

export type AppRouter = typeof router;
