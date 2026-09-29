import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { agentFilePaths, isDeprecatedAgent } from "./monomind-catalog.ts";

describe("monomind catalog", () => {
  it("detects deprecated agents from frontmatter only", () => {
    assert.equal(isDeprecatedAgent("---\nname: monoswarm-pr\ndeprecated: true\ndeprecatedBy: pr-manager\n---\nBody"), true);
    assert.equal(isDeprecatedAgent("---\nname: coder\n---\nThis agent is not deprecated: true in body."), false);
    assert.equal(isDeprecatedAgent("---\nname: x\ndeprecated: false\n---\n"), false);
    assert.equal(isDeprecatedAgent("no frontmatter\ndeprecated: true"), false);
  });

  it("keeps only agent markdown files", () => {
    assert.deepEqual(
      agentFilePaths([
        "/.claude/agents/core/coder.md",
        "/.claude/agents/specialized/mobile/spec-mobile-react-native.md",
        "/.claude/agents/README.md",
        "/.claude/agents/core/config.yaml",
        "/.claude/skills/x/SKILL.md",
      ]),
      ["/.claude/agents/core/coder.md", "/.claude/agents/specialized/mobile/spec-mobile-react-native.md"],
    );
  });
});
