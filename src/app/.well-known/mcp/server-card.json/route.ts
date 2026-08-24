import { mcpServerCard } from "@/lib/mcp/server-card";

export function GET() {
  return Response.json(mcpServerCard());
}
