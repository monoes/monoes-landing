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
      return { url: "data:text/javascript,export const feature = {}; export const featureVote = {}; export const user = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("feature validation", () => {
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
    assert.equal(isValidTitle("Dark mode for the dashboard"), true);
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
    assert.equal(isValidDescription("It would be great if the dashboard supported a dark theme."), true);
  });
});
