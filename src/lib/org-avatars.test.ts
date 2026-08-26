import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { avatarCandidates, avatarMapFor, roleAvatar } from "./org-avatars.ts";

describe("avatarCandidates", () => {
  it("matches a role id directly against the known avatar list", () => {
    assert.equal(avatarCandidates({ id: "coder" })[0], "coder");
  });

  it("matches by agent_type when the id itself isn't a known avatar", () => {
    assert.equal(avatarCandidates({ id: "our-lead-dev", agent_type: "backend-dev" })[0], "backend-dev");
  });

  it("always falls back to 'coder' as the last candidate", () => {
    const candidates = avatarCandidates({ id: "totally-unmatched-role-xyz" });
    assert.equal(candidates[candidates.length - 1], "coder");
  });

  it("respects a role's custom avatar via roleAvatar", () => {
    assert.equal(roleAvatar({ id: "x", avatar: "/custom/foo.svg" }), "/custom/foo.svg");
  });
});

describe("avatarMapFor", () => {
  it("assigns distinct avatars to roles that would otherwise pick the same one", () => {
    const roles = [
      { id: "coder-1", agent_type: "coder" },
      { id: "coder-2", agent_type: "coder" },
    ];
    const map = avatarMapFor(roles);
    assert.notEqual(map.get("coder-1"), map.get("coder-2"));
  });

  it("leaves a role with a custom avatar untouched and exempt from dedup", () => {
    const roles = [
      { id: "a", agent_type: "coder", avatar: "/custom/a.svg" },
      { id: "b", agent_type: "coder" },
    ];
    const map = avatarMapFor(roles);
    assert.equal(map.get("a"), "/custom/a.svg");
    assert.ok(map.get("b"));
  });

  it("returns paths rooted at /org-avatars for built-in picks", () => {
    const map = avatarMapFor([{ id: "coder" }]);
    assert.equal(map.get("coder"), "/org-avatars/coder.svg");
  });
});
