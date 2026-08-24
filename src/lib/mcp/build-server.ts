import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_DEFINITIONS } from "./tools";

/**
 * Builds a fresh McpServer for one HTTP request. Stateless mode requires a
 * new server + transport per request (see src/app/api/mcp/route.ts) — this
 * function is what makes that cheap: registering 11 tools is pure
 * in-memory setup, no I/O.
 *
 * `authHeader` is the inbound request's raw Authorization header, forwarded
 * unchanged into every tool's underlying REST route call. The MCP layer
 * never inspects or verifies it itself — that stays entirely in
 * getAuthenticatedUser, exactly as it does for the REST API.
 */
export function buildMcpServer(authHeader: string | null): McpServer {
  const server = new McpServer({ name: "monoes-community", version: "0.1.0" });

  for (const tool of TOOL_DEFINITIONS) {
    server.registerTool(
      tool.name,
      { title: tool.title, description: tool.description, inputSchema: tool.inputSchema },
      async (args) => tool.call(args, authHeader),
    );
  }

  return server;
}
