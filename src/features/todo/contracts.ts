import { oc } from "@orpc/contract";
import { z } from "zod";

const TodoSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(100),
    completed: z.boolean(),
});

export const todoContract = {
    list: oc
        .route({ method: "GET", path: "/todos", summary: "List all todos" })
        .output(z.array(TodoSchema)),
};
