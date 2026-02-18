import { oc } from "@orpc/contract";
import { z } from "zod";

export const TodoSchema = z.object({
    id: z.string(),
    title: z.string(),
});

export const todoContract = {
    list: oc
        .route({ method: "GET", path: "/todos", summary: "List all todos" })
        .output(z.array(TodoSchema)),
};
