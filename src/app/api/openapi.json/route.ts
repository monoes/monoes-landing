import { buildOpenApiSpec } from "@/lib/docs/openapi";

export function GET() {
  return Response.json(buildOpenApiSpec());
}
