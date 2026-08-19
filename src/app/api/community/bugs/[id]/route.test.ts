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
      return { url: "data:text/javascript,export const bug = {};", shortCircuit: true };
    }
    if (specifier === "@/lib/community/is-moderator") {
      return { url: "data:text/javascript,export const isModerator = () => true;", shortCircuit: true };
    }
    if (specifier === "drizzle-orm") {
      return { url: "data:text/javascript,export const eq = () => {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("bug status/severity validation", () => {
  it("isValidStatus accepts open, in_progress, resolved, wontfix only", async () => {
    const { isValidStatus } = await import("./route.ts");
    assert.equal(isValidStatus("open"), true);
    assert.equal(isValidStatus("in_progress"), true);
    assert.equal(isValidStatus("resolved"), true);
    assert.equal(isValidStatus("wontfix"), true);
    assert.equal(isValidStatus("closed"), false);
  });

  it("isValidSeverity accepts low, medium, high, critical only", async () => {
    const { isValidSeverity } = await import("./route.ts");
    assert.equal(isValidSeverity("critical"), true);
    assert.equal(isValidSeverity("urgent"), false);
  });
});
