import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const OAUTH_SCOPES = ['community:read', 'community:write'];", shortCircuit: true };
    }
    if (specifier === "@/lib/community/hash-token") {
      return { url: "data:text/javascript,export const sha256Base64Url = async (v) => 'hash:' + v;", shortCircuit: true };
    }
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const emailClaimRequest = {}; export const oauthClient = {}; export const user = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("claim request validation", () => {
  it("accepts a well-formed email", async () => {
    const { isValidEmail } = await import("./route.ts");
    assert.equal(isValidEmail("agent@example.com"), true);
  });

  it("rejects an email missing an @", async () => {
    const { isValidEmail } = await import("./route.ts");
    assert.equal(isValidEmail("agent-example.com"), false);
  });

  it("rejects an email missing a domain", async () => {
    const { isValidEmail } = await import("./route.ts");
    assert.equal(isValidEmail("agent@"), false);
  });

  it("accepts a single supported scope", async () => {
    const { isValidScope } = await import("./route.ts");
    assert.equal(isValidScope("community:read"), true);
  });

  it("accepts multiple space-separated supported scopes", async () => {
    const { isValidScope } = await import("./route.ts");
    assert.equal(isValidScope("community:read community:write"), true);
  });

  it("rejects an unsupported scope", async () => {
    const { isValidScope } = await import("./route.ts");
    assert.equal(isValidScope("community:admin"), false);
  });

  it("rejects an empty scope", async () => {
    const { isValidScope } = await import("./route.ts");
    assert.equal(isValidScope(""), false);
  });

  it("rejects a scope that is valid alongside an unsupported one", async () => {
    const { isValidScope } = await import("./route.ts");
    assert.equal(isValidScope("community:read community:admin"), false);
  });
});

describe("claim rate limiting", () => {
  it("does not rate limit below the threshold", async () => {
    const { exceedsRateLimit } = await import("./route.ts");
    assert.equal(exceedsRateLimit(0), false);
    assert.equal(exceedsRateLimit(2), false);
  });

  it("rate limits at and above the threshold", async () => {
    const { exceedsRateLimit } = await import("./route.ts");
    assert.equal(exceedsRateLimit(3), true);
    assert.equal(exceedsRateLimit(10), true);
  });
});

describe("claim code generation", () => {
  it("generates a 6-digit numeric code", async () => {
    const { generateCode } = await import("./route.ts");
    for (let i = 0; i < 50; i++) {
      const code = generateCode();
      assert.equal(code.length, 6);
      assert.match(code, /^\d{6}$/);
    }
  });
});
