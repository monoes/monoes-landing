import packageJson from "../../../package.json";

function baseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

// SEP-2127 MCP Server Card shape:
// https://github.com/modelcontextprotocol/modelcontextprotocol/blob/aa59517442d323a33ed915fc408f1584c4a23dfa/seps/2127-mcp-server-cards.md
// `remotes[0].url` points at a real, connectable MCP endpoint
// (src/app/api/mcp/route.ts) — a server card is descriptive metadata, but
// the endpoint it describes must actually work.
export function mcpServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "me.monoes/community",
    version: packageJson.version,
    title: "Monoes Community MCP Server",
    description:
      "MCP tools for the monoes.me community: feature requests, bug reports, forum posts, and org uploads.",
    websiteUrl: `${baseUrl()}/community/api-docs`,
    remotes: [{ type: "streamable-http", url: `${baseUrl()}/api/mcp` }],
  };
}
