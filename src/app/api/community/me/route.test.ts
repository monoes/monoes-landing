import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/community/get-authenticated-user") {
      return { url: "data:text/javascript,export const getAuthenticatedUser = async () => globalThis.__stubSession;", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { GET } = await import("./route.ts");

describe("GET /api/community/me", () => {
  it("returns 401 when unauthenticated", async () => {
    globalThis.__stubSession = null;
    const res = await GET(new Request("http://localhost/api/community/me"));
    assert.equal(res.status, 401);
  });

  it("returns the authenticated user's id and username", async () => {
    globalThis.__stubSession = { user: { id: "u1", username: "someone", role: "member", blockedAt: null } };
    const res = await GET(new Request("http://localhost/api/community/me"));
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.deepEqual(json, { id: "u1", username: "someone" });
  });
});
