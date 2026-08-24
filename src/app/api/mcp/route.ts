import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildMcpServer } from "@/lib/mcp/build-server";

// Stateless Streamable HTTP MCP endpoint: a fresh McpServer + transport per
// request (sessionIdGenerator: undefined disables session tracking, which
// Cloudflare Workers can't hold across requests anyway without Durable
// Objects — not needed for this simple, self-contained tool set). See
// docs/mastermind/specs/2026-08-24-mcp-server-design.md.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const server = buildMcpServer(authHeader);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(request);
}
