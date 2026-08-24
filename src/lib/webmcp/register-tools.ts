import { projects } from "@/lib/projects";

type WebMcpToolResponse = { content: Array<{ type: "text"; text: string }> };

type WebMcpToolDescriptor = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, unknown>; required: string[] };
  execute: () => WebMcpToolResponse;
};

type NavigatorWithModelContext = Navigator & {
  modelContext?: { registerTool: (tool: WebMcpToolDescriptor) => void };
};

/**
 * Registers WebMCP tools (navigator.modelContext.registerTool) — the
 * in-page counterpart to the server-side MCP server at /api/mcp. Only
 * available in secure contexts on browsers that support the (still
 * proposal-stage) WebMCP API, so this is feature-detected and a no-op
 * everywhere else. See https://webmachinelearning.github.io/webmcp/.
 */
export function registerWebMcpTools(): void {
  if (typeof navigator === "undefined") return;
  const modelContext = (navigator as NavigatorWithModelContext).modelContext;
  if (!modelContext) return;

  modelContext.registerTool({
    name: "list_projects",
    description: "List monoes' open-source AI agent projects (Monomind, Mono Agent, MonoClip, MonoTask, and others) with their tagline, description, and GitHub repository.",
    inputSchema: { type: "object", properties: {}, required: [] },
    execute: () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            projects.map((project) => ({
              name: project.name,
              slug: project.slug,
              tagline: project.tagline,
              description: project.description,
              repo: project.repo,
            })),
          ),
        },
      ],
    }),
  });
}
