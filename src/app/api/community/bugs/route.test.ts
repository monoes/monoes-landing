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
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("bug report validation", () => {
  it("rejects empty titles", async () => {
    const { isValidTitle } = await import("./route.ts");
    assert.equal(isValidTitle(""), false);
  });

  it("rejects titles longer than 100 characters", async () => {
    const { isValidTitle } = await import("./route.ts");
    assert.equal(isValidTitle("a".repeat(101)), false);
  });

  it("accepts a reasonable title", async () => {
    const { isValidTitle } = await import("./route.ts");
    assert.equal(isValidTitle("Login button does nothing on Safari"), true);
  });

  it("rejects empty descriptions", async () => {
    const { isValidDescription } = await import("./route.ts");
    assert.equal(isValidDescription(""), false);
  });

  it("rejects descriptions longer than 1000 characters", async () => {
    const { isValidDescription } = await import("./route.ts");
    assert.equal(isValidDescription("a".repeat(1001)), false);
  });

  it("accepts a reasonable description", async () => {
    const { isValidDescription } = await import("./route.ts");
    assert.equal(isValidDescription("Clicking the login button on Safari 17 does nothing."), true);
  });

  it("isValidSeverity accepts low, medium, high, critical only", async () => {
    const { isValidSeverity } = await import("./route.ts");
    assert.equal(isValidSeverity("low"), true);
    assert.equal(isValidSeverity("medium"), true);
    assert.equal(isValidSeverity("high"), true);
    assert.equal(isValidSeverity("critical"), true);
    assert.equal(isValidSeverity("urgent"), false);
    assert.equal(isValidSeverity(undefined), false);
  });
});
