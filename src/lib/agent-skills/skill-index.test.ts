import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { createHash } from "node:crypto";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@opennextjs/cloudflare") {
      return { url: "data:text/javascript,export const getCloudflareContext = () => globalThis.__stubCloudflareContext();", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { agentSkillsIndex } = await import("./skill-index.ts");

describe("agentSkillsIndex", () => {
  it("computes the digest from the actual served SKILL.md bytes and returns a well-formed index", async () => {
    const content = "---\nname: monoes-community\n---\n\nSome skill content.\n";
    const expectedDigest = createHash("sha256").update(content).digest("hex");

    globalThis.__stubCloudflareContext = () => ({
      env: {
        ASSETS: {
          fetch: mock.fn(async (request: Request) => {
            assert.match(request.url, /\/\.well-known\/agent-skills\/monoes-community\/SKILL\.md$/);
            return new Response(content, { status: 200 });
          }),
        },
      },
    });

    const index = await agentSkillsIndex();
    assert.equal(index.$schema, "https://schemas.agentskills.io/discovery/0.2.0/schema.json");
    assert.equal(index.skills.length, 1);
    const skill = index.skills[0];
    assert.equal(skill.name, "monoes-community");
    assert.equal(skill.type, "skill-md");
    assert.equal(skill.digest, `sha256:${expectedDigest}`);
    assert.match(skill.url, /\/\.well-known\/agent-skills\/monoes-community\/SKILL\.md$/);
  });

  it("throws when the SKILL.md asset can't be fetched", async () => {
    globalThis.__stubCloudflareContext = () => ({
      env: { ASSETS: { fetch: mock.fn(async () => new Response("not found", { status: 404 })) } },
    });
    await assert.rejects(() => agentSkillsIndex());
  });
});
