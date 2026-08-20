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
      return { url: "data:text/javascript,export const user = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("profile field validation", () => {
  it("isValidTagline accepts empty string and up to 140 chars, rejects longer", async () => {
    const { isValidTagline } = await import("./route.ts");
    assert.equal(isValidTagline(""), true);
    assert.equal(isValidTagline("a".repeat(140)), true);
    assert.equal(isValidTagline("a".repeat(141)), false);
  });

  it("isValidJobTitle and isValidCompany accept empty and up to 80 chars, reject longer", async () => {
    const { isValidJobTitle, isValidCompany } = await import("./route.ts");
    assert.equal(isValidJobTitle(""), true);
    assert.equal(isValidJobTitle("a".repeat(80)), true);
    assert.equal(isValidJobTitle("a".repeat(81)), false);
    assert.equal(isValidCompany("a".repeat(80)), true);
    assert.equal(isValidCompany("a".repeat(81)), false);
  });

  it("isValidTags accepts up to 10 tags of 1-24 valid chars, rejects 11 or bad chars", async () => {
    const { isValidTags } = await import("./route.ts");
    assert.equal(isValidTags([]), true);
    assert.equal(isValidTags(Array.from({ length: 10 }, (_, i) => `tag${i}`)), true);
    assert.equal(isValidTags(Array.from({ length: 11 }, (_, i) => `tag${i}`)), false);
    assert.equal(isValidTags(["bad tag!"]), false);
    assert.equal(isValidTags(["a".repeat(25)]), false);
    assert.equal(isValidTags(["rust", "ai-agents"]), true);
  });

  it("isValidSocialUrl requires https and rejects http", async () => {
    const { isValidSocialUrl } = await import("./route.ts");
    assert.equal(isValidSocialUrl(""), true);
    assert.equal(isValidSocialUrl("https://example.com"), true);
    assert.equal(isValidSocialUrl("http://example.com"), false);
    assert.equal(isValidSocialUrl("not a url"), false);
  });

  it("isValidSocialUrl enforces the expected host when given", async () => {
    const { isValidSocialUrl } = await import("./route.ts");
    assert.equal(isValidSocialUrl("https://github.com/monoes", ["github.com"]), true);
    assert.equal(isValidSocialUrl("https://sub.github.com/monoes", ["github.com"]), true);
    assert.equal(isValidSocialUrl("https://evil.com/github.com", ["github.com"]), false);
    assert.equal(isValidSocialUrl("https://x.com/monoes", ["x.com", "twitter.com"]), true);
    assert.equal(isValidSocialUrl("https://twitter.com/monoes", ["x.com", "twitter.com"]), true);
  });
});
