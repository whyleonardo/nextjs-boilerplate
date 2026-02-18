/**
 * Todo contract — contract-first definition.
 *
 * This file contains ONLY the API shape: input schemas, output schemas, and
 * HTTP route metadata. There is zero implementation logic here. Both the
 * server (implementation) and the client (type inference) import from this
 * single source of truth, guaranteeing they can never drift apart.
 */
import { oc } from "@orpc/contract";
import * as z from "zod";

/** Canonical shape of a Todo item returned by the API. */
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  userId: z.string(),
  createdAt: z.string().datetime(),
});

export type Todo = z.infer<typeof TodoSchema>;

/**
 * Todo contract router.
 *
 * Each entry defines:
 *  - `.route()` — HTTP method + path (consumed by the OpenAPI handler)
 *  - `.input()` — validated request payload schema
 *  - `.output()` — guaranteed response shape
 *
 * The server must implement every procedure here; TypeScript will error if
 * the handler's return type doesn't satisfy the declared output schema.
 */
export const todoContract = {
  list: oc.route({ method: "GET", path: "/todos" }).output(z.array(TodoSchema)),

  create: oc
    .route({ method: "POST", path: "/todos" })
    .input(
      z.object({
        title: z.string().min(1).max(255),
      })
    )
    .output(TodoSchema),
};
