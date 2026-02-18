import { NextResponse } from "next/server";
import { generateOpenAPISpec } from "@/server/rpc/openapi";

export function GET() {
  const spec = generateOpenAPISpec();

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
