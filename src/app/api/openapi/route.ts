import { type NextRequest, NextResponse } from "next/server";
import { generateOpenAPISpec } from "@/server/rpc/openapi";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  // Return Scalar UI if format=ui or Accept header prefers HTML
  const acceptHeader = request.headers.get("accept") || "";
  const wantsHtml =
    format === "ui" ||
    (acceptHeader.includes("text/html") &&
      !acceptHeader.includes("application/json"));

  if (wantsHtml) {
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>API Reference</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <div id="api-reference"></div>

          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
          <script>
            Scalar.createApiReference('#api-reference', {
              url: '/api/openapi?format=json',
              theme: 'purple',
            })
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  // Return JSON spec by default
  const spec = generateOpenAPISpec();

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
