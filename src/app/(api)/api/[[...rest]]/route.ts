import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { router } from "@/server/rpc";
import { auth } from "@/server/auth";

const openAPIHandler = new OpenAPIHandler(router, {
    interceptors: [
        onError((error) => {
            console.error(error);
        }),
    ],
    plugins: [
        new SmartCoercionPlugin({
            schemaConverters: [new ZodToJsonSchemaConverter()],
        }),
        new OpenAPIReferencePlugin({
            schemaConverters: [new ZodToJsonSchemaConverter()],
            specGenerateOptions: async () => {
                const authOpenAPISchema =
                    await auth.api.generateOpenAPISchema();

                authOpenAPISchema.paths = Object.fromEntries(
                    Object.entries(authOpenAPISchema.paths).map(
                        ([key, value]) => {
                            return [`/auth${key}`, value];
                        },
                    ),
                );

                return {
                    info: {
                        title: "API",
                        version: "1.0.0",
                    },
                    security: [{ bearerAuth: [] }],
                    components: {
                        securitySchemes: {
                            bearerAuth: {
                                type: "http",
                                scheme: "bearer",
                            },
                        },
                    },
                    ...(authOpenAPISchema as any),
                    servers: [
                        {
                            url: "/api",
                        },
                    ],
                };
            },
            docsConfig: {
                authentication: {
                    securitySchemes: {
                        bearerAuth: {
                            token: "default-token",
                        },
                    },
                },
            },
        }),
    ],
});

async function handleRequest(request: Request) {
    const { response } = await openAPIHandler.handle(request, {
        prefix: "/api",
        context: {},
    });

    return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
