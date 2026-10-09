import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/community/hash-token") {
      return { url: "data:text/javascript,export const sha256Base64Url = async (v) => 'hash:' + v;", shortCircuit: true };
    }
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const getAuth = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/monoagent-token") return next("../../../../../../lib/monoagent-token.ts", context);
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const emailClaimRequest = {}; export const oauthAccessToken = {}; export const oauthRefreshToken = {}; export const user = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("claim verify expiry", () => {
  it("treats a future expiresAt as not expired", async () => {
    const { isExpired } = await import("./route.ts");
    const now = new Date("2026-08-23T12:00:00Z");
    const expiresAt = new Date("2026-08-23T12:05:00Z");
    assert.equal(isExpired(expiresAt, now), false);
  });

  it("treats a past expiresAt as expired", async () => {
    const { isExpired } = await import("./route.ts");
    const now = new Date("2026-08-23T12:00:00Z");
    const expiresAt = new Date("2026-08-23T11:55:00Z");
    assert.equal(isExpired(expiresAt, now), true);
  });
});

describe("claim verify attempts", () => {
  it("does not exhaust attempts below the max", async () => {
    const { attemptsExhausted } = await import("./route.ts");
    assert.equal(attemptsExhausted(0), false);
    assert.equal(attemptsExhausted(4), false);
  });

  it("exhausts attempts at and above the max", async () => {
    const { attemptsExhausted } = await import("./route.ts");
    assert.equal(attemptsExhausted(5), true);
    assert.equal(attemptsExhausted(9), true);
  });
});

describe("opaque token generation", () => {
  it("generates a URL-safe value with no padding", async () => {
    const { generateOpaqueToken } = await import("./route.ts");
    for (let i = 0; i < 20; i++) {
      const generated = /* value */ generateOpaqueToken();
      assert.match(generated, /^[A-Za-z0-9_-]+$/);
      assert.ok(generated.length > 0);
    }
  });

  it("generates distinct values across calls", async () => {
    const { generateOpaqueToken } = await import("./route.ts");
    const a = /* value */ generateOpaqueToken();
    const b = /* value */ generateOpaqueToken();
    assert.notEqual(a, b);
  });
});

// The stubbed database is an empty object: a request that reached it would throw, so these pass
// only if the answer is given before the code is looked at (and so before it can be used up).
describe("claim verify resource", () => {
  const post = async (body: object) => {
    const { POST } = await import("./route.ts");
    return POST(
      new Request("https://monoes.test/api/auth/agent/claim/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@example.com", code: "123456", client_id: "monoagent", ...body }),
      }),
    );
  };

  it("answers invalid_target for another audience", async () => {
    const res = await post({ resource: "https://example.com/other" });
    assert.deepEqual([res.status, await res.json()], [400, { error: "invalid_target" }]);
  });

  it("answers invalid_target when another client asks for the MonoAgent audience", async () => {
    const res = await post({ client_id: "some-agent", resource: "https://monoes.me/api/monoagent" });
    assert.deepEqual([res.status, await res.json()], [400, { error: "invalid_target" }]);
  });
});
