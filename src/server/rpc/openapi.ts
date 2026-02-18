import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { env } from "@/env";
import { router } from "./index";

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export function generateOpenAPISpec() {
  return generator.generate(router, {
    info: {
      title: "API",
      version: "1.0.0",
      description: "Generated API documentation",
    },
    servers: [
      {
        url: `${env.NEXT_PUBLIC_APP_URL}/api/rpc`,
        description: "API server",
      },
    ],
  });
}
