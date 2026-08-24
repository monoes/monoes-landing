function baseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Fetches a public/ static asset via the Workers ASSETS binding (same
 * pattern as middleware.ts's markdown negotiation) so the digest below is
 * always computed from the exact bytes actually served — never a
 * precomputed value that could drift from the real file, the failure mode
 * that broke Markdown-for-Agents earlier this session.
 */
async function fetchAssetBytes(pathname: string): Promise<ArrayBuffer> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = getCloudflareContext();
  const response = await env.ASSETS.fetch(new Request(new URL(pathname, baseUrl())));
  if (!response.ok) {
    throw new Error(`Failed to fetch skill asset ${pathname}: ${response.status}`);
  }
  return response.arrayBuffer();
}

// RFC-8615-style discovery index for the Agent Skills Discovery spec
// (https://github.com/cloudflare/agent-skills-discovery-rfc). Digest is
// computed live, at request time, from the actual served SKILL.md bytes.
export async function agentSkillsIndex() {
  const skillPath = "/.well-known/agent-skills/monoes-community/SKILL.md";
  const bytes = await fetchAssetBytes(skillPath);
  const digest = await sha256Hex(bytes);

  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "monoes-community",
        type: "skill-md",
        description:
          "Interact with the monoes.me community API and MCP server — register an OAuth client, authenticate, and read/write feature requests, bug reports, forum posts, and org uploads.",
        url: `${baseUrl()}${skillPath}`,
        digest: `sha256:${digest}`,
      },
    ],
  };
}
