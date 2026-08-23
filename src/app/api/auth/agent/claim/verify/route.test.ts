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
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const emailClaimRequest = {}; export const oauthAccessToken = {}; export const user = {};", shortCircuit: true };
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
