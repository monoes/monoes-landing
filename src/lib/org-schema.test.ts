import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OrgDefSchema } from "./org-schema.ts";

const MINIMAL_VALID_ORG = {
  name: "test-org",
  roles: [{ id: "boss" }],
};

describe("OrgDefSchema", () => {
  it("accepts a minimal valid org with one role", () => {
    const result = OrgDefSchema.safeParse(MINIMAL_VALID_ORG);
    assert.equal(result.success, true);
  });

  it("rejects an org missing a name", () => {
    const result = OrgDefSchema.safeParse({ roles: [{ id: "boss" }] });
    assert.equal(result.success, false);
  });

  it("rejects an org with an empty roles array", () => {
    const result = OrgDefSchema.safeParse({ name: "test-org", roles: [] });
    assert.equal(result.success, false);
  });

  it("rejects an org missing the roles field entirely", () => {
    const result = OrgDefSchema.safeParse({ name: "test-org" });
    assert.equal(result.success, false);
  });

  it("rejects a role missing an id", () => {
    const result = OrgDefSchema.safeParse({ name: "test-org", roles: [{ title: "Boss" }] });
    assert.equal(result.success, false);
  });

  it("fills in defaults for a minimal role (title, type, reports_to, responsibilities)", () => {
    const result = OrgDefSchema.safeParse(MINIMAL_VALID_ORG);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.roles[0].title, "");
      assert.equal(result.data.roles[0].type, "specialist");
      assert.equal(result.data.roles[0].reports_to, null);
      assert.deepEqual(result.data.roles[0].responsibilities, []);
    }
  });

  it("preserves unknown top-level fields via passthrough (e.g. topology)", () => {
    const result = OrgDefSchema.safeParse({ ...MINIMAL_VALID_ORG, topology: "star" });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal((result.data as { topology?: string }).topology, "star");
    }
  });

  it("accepts a multi-role hierarchical org with reports_to and responsibilities", () => {
    const result = OrgDefSchema.safeParse({
      name: "docs-team",
      goal: "Write great docs",
      roles: [
        { id: "boss", title: "Lead", reports_to: null, responsibilities: ["plan"] },
        { id: "writer", title: "Writer", reports_to: "boss", responsibilities: ["write docs"] },
      ],
    });
    assert.equal(result.success, true);
  });
});
