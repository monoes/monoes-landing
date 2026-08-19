import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const getAuth = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const orgUpload = {};", shortCircuit: true };
    }
    if (specifier === "@/lib/org-schema") {
      return next("file:///Volumes/SD1/projects/monoes/monoes-landing/src/lib/org-schema.ts", context);
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("org upload validation", () => {
  it("isValidOrgJsonSize accepts text under 500 KB", async () => {
    const { isValidOrgJsonSize } = await import("./route.ts");
    assert.equal(isValidOrgJsonSize("a".repeat(1000)), true);
  });

  it("isValidOrgJsonSize rejects text over 500 KB", async () => {
    const { isValidOrgJsonSize } = await import("./route.ts");
    assert.equal(isValidOrgJsonSize("a".repeat(500_001)), false);
  });

  it("parseAndValidateOrgJson rejects invalid JSON syntax", async () => {
    const { parseAndValidateOrgJson } = await import("./route.ts");
    const result = parseAndValidateOrgJson("{not valid json");
    assert.equal(result.success, false);
  });

  it("parseAndValidateOrgJson rejects JSON that fails schema validation", async () => {
    const { parseAndValidateOrgJson } = await import("./route.ts");
    const result = parseAndValidateOrgJson(JSON.stringify({ roles: [] }));
    assert.equal(result.success, false);
  });

  it("parseAndValidateOrgJson accepts a valid minimal org", async () => {
    const { parseAndValidateOrgJson } = await import("./route.ts");
    const result = parseAndValidateOrgJson(JSON.stringify({ name: "test-org", roles: [{ id: "boss" }] }));
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.name, "test-org");
      assert.equal(result.data.roles.length, 1);
    }
  });

  it("extractTopology returns the topology string when present", async () => {
    const { extractTopology, parseAndValidateOrgJson } = await import("./route.ts");
    const result = parseAndValidateOrgJson(JSON.stringify({ name: "test-org", topology: "star", roles: [{ id: "boss" }] }));
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(extractTopology(result.data), "star");
    }
  });

  it("extractTopology returns null when topology is absent", async () => {
    const { extractTopology, parseAndValidateOrgJson } = await import("./route.ts");
    const result = parseAndValidateOrgJson(JSON.stringify({ name: "test-org", roles: [{ id: "boss" }] }));
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(extractTopology(result.data), null);
    }
  });

  it("extractTopology returns null when topology is present but not a string", async () => {
    const { extractTopology, parseAndValidateOrgJson } = await import("./route.ts");
    const result = parseAndValidateOrgJson(JSON.stringify({ name: "test-org", topology: 123, roles: [{ id: "boss" }] }));
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(extractTopology(result.data), null);
    }
  });
});
