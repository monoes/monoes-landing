import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { monoAgentGuides } from "./mono-agent-guides.ts";
import { buyerGuides } from "./buyer-guides.ts";
import { automationComparisons } from "./compare-automation.ts";
import { agentComparisons } from "./compare-agents.ts";

const guidePaths = new Set([...buyerGuides, ...monoAgentGuides].map((g) => `/guides/${g.slug}`));
const comparePaths = new Set([...automationComparisons, ...agentComparisons].map((g) => `/compare/${g.slug}`));
const staticPaths = new Set(["/guides", "/compare", "/projects/mono-agent", "/workforce"]);

describe("monoAgentGuides", () => {
  it("has the four expected, unique slugs", () => {
    assert.deepEqual(
      monoAgentGuides.map((g) => g.slug),
      ["n8n-without-docker", "leaving-openai-agent-builder", "no-ai-credits-automation", "claude-code-routines-and-mono-agent"],
    );
    const all = [...buyerGuides, ...monoAgentGuides].map((g) => g.slug);
    assert.equal(new Set(all).size, all.length);
  });

  it("gives every guide a parseable date, a summary, 3-6 FAQs and full table rows", () => {
    for (const g of monoAgentGuides) {
      assert.ok(!Number.isNaN(new Date(g.updated).getTime()), g.slug);
      assert.ok(g.summary.length > 100, g.slug);
      assert.ok(g.faqs.length >= 3 && g.faqs.length <= 6, g.slug);
      for (const row of g.table?.rows ?? []) assert.equal(row.length, g.table!.columns.length, `${g.slug}: ${row[0]}`);
    }
  });

  it("links only to pages that exist", () => {
    for (const g of monoAgentGuides) {
      for (const { href } of g.related) {
        assert.ok(guidePaths.has(href) || comparePaths.has(href) || staticPaths.has(href), `${g.slug} -> ${href}`);
      }
    }
  });

  it("never calls current Mono Agent open source or account-free", () => {
    const text = JSON.stringify(monoAgentGuides);
    assert.doesNotMatch(text, /no account|without an account|open[- ]source \(MIT\)|is open source/i);
  });
});
