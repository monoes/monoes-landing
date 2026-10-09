import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/community/hash-token") return next("./hash-token.ts", context);
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const getAuth = () => ({ api: { getSession: async () => globalThis.__stubSession } });", shortCircuit: true };
    }
    if (specifier === "@/lib/community/verify-access-jwt") {
      return { url: "data:text/javascript,export const looksLikeJwt = (t) => t.split('.').length === 3; export const verifyMonoagentAccessToken = async () => { globalThis.__jwtCalls = (globalThis.__jwtCalls ?? 0) + 1; return globalThis.__stubJwt; };", shortCircuit: true };
    }
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => globalThis.__stubDb();", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const oauthAccessToken = {}; export const user = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { getAuthenticatedUser, getRequestAuth } = await import("./get-authenticated-user.ts");

function selectChain(rows: unknown[]) {
  return { from: () => ({ where: () => ({ limit: async () => rows }) }) };
}

describe("getAuthenticatedUser", () => {
  it("returns the session user when a valid session cookie is present", async () => {
    globalThis.__stubSession = { user: { id: "u1", username: "someone", role: "member", blockedAt: null } };
    const req = new Request("http://localhost/api/community/feed");
    const result = await getAuthenticatedUser(req, "community:read");
    assert.equal(result?.user.id, "u1");
  });

  it("falls back to a valid Bearer token with the required scope", async () => {
    globalThis.__stubSession = null;
    const accessTokenRow = {
      userId: "u2",
      scopes: ["community:read", "community:write"],
      expiresAt: new Date(Date.now() + 60_000),
      revoked: null,
    };
    let queriedTable = 0;
    globalThis.__stubDb = () => ({
      select: mock.fn(() => {
        queriedTable++;
        if (queriedTable === 1) return selectChain([accessTokenRow]);
        return selectChain([{ id: "u2", username: "agentuser", role: "member", blockedAt: null }]);
      }),
    });
    const req = new Request("http://localhost/api/community/feed", {
      headers: { Authorization: "Bearer valid-token-value" },
    });
    const result = await getAuthenticatedUser(req, "community:read");
    assert.equal(result?.user.id, "u2");
    assert.equal(result?.user.username, "agentuser");
  });

  it("falls back to a valid Bearer token when scopes is a JSON-encoded string instead of an array", async () => {
    globalThis.__stubSession = null;
    const accessTokenRow = {
      userId: "u2b",
      scopes: '["community:read","community:write"]',
      expiresAt: new Date(Date.now() + 60_000),
      revoked: null,
    };
    let queriedTable = 0;
    globalThis.__stubDb = () => ({
      select: mock.fn(() => {
        queriedTable++;
        if (queriedTable === 1) return selectChain([accessTokenRow]);
        return selectChain([{ id: "u2b", username: "agentuser2", role: "member", blockedAt: null }]);
      }),
    });
    const req = new Request("http://localhost/api/community/posts", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token-value" },
    });
    const result = await getAuthenticatedUser(req, "community:write");
    assert.equal(result?.user.id, "u2b");
  });

  it("rejects a Bearer token missing the required scope", async () => {
    globalThis.__stubSession = null;
    const accessTokenRow = {
      userId: "u3",
      scopes: ["community:read"],
      expiresAt: new Date(Date.now() + 60_000),
      revoked: null,
    };
    globalThis.__stubDb = () => ({ select: mock.fn(() => selectChain([accessTokenRow])) });
    const req = new Request("http://localhost/api/community/posts", {
      method: "POST",
      headers: { Authorization: "Bearer some-token" },
    });
    const result = await getAuthenticatedUser(req, "community:write");
    assert.equal(result, null);
  });

  it("rejects an expired Bearer token", async () => {
    globalThis.__stubSession = null;
    const accessTokenRow = {
      userId: "u4",
      scopes: ["community:read", "community:write"],
      expiresAt: new Date(Date.now() - 60_000),
      revoked: null,
    };
    globalThis.__stubDb = () => ({ select: mock.fn(() => selectChain([accessTokenRow])) });
    const req = new Request("http://localhost/api/community/feed", {
      headers: { Authorization: "Bearer expired-token" },
    });
    const result = await getAuthenticatedUser(req, "community:read");
    assert.equal(result, null);
  });

  it("rejects a revoked Bearer token", async () => {
    globalThis.__stubSession = null;
    const accessTokenRow = {
      userId: "u5",
      scopes: ["community:read", "community:write"],
      expiresAt: new Date(Date.now() + 60_000),
      revoked: new Date(),
    };
    globalThis.__stubDb = () => ({ select: mock.fn(() => selectChain([accessTokenRow])) });
    const req = new Request("http://localhost/api/community/feed", {
      headers: { Authorization: "Bearer revoked-token" },
    });
    const result = await getAuthenticatedUser(req, "community:read");
    assert.equal(result, null);
  });

  it("returns null when there is no session and no Authorization header", async () => {
    globalThis.__stubSession = null;
    const req = new Request("http://localhost/api/community/feed");
    const result = await getAuthenticatedUser(req, "community:read");
    assert.equal(result, null);
  });

  it("returns null when no access token row matches the hashed value", async () => {
    globalThis.__stubSession = null;
    globalThis.__stubDb = () => ({ select: mock.fn(() => selectChain([])) });
    const req = new Request("http://localhost/api/community/feed", {
      headers: { Authorization: "Bearer unknown-token" },
    });
    const result = await getAuthenticatedUser(req, "community:read");
    assert.equal(result, null);
  });
});

describe("getAuthenticatedUser with an audience-bound MonoAgent token (a JWT)", () => {
  const request = (token: string) => new Request("http://localhost/api/library/me", { headers: { Authorization: `Bearer ${token}` } });
  const jwt = request("header.payload.signature");
  const verified = (scopes: string[]) => (globalThis.__stubJwt = { userId: "u6", scopes });
  const userRow = (row: unknown) => (globalThis.__stubDb = () => ({ select: mock.fn(() => selectChain(row ? [row] : [])) }));
  const member = { id: "u6", username: "agentuser", role: "member", blockedAt: null };

  it("resolves the user the verified token names, with the token's scopes, and checks the scope", async () => {
    globalThis.__stubSession = null;
    verified(["library:read", "library:write"]);
    userRow(member);
    const result = await getRequestAuth(jwt, "library:write");
    assert.deepEqual([result?.user.id, result?.scopes], ["u6", ["library:read", "library:write"]]);
    verified(["library:read"]);
    assert.equal(await getAuthenticatedUser(jwt, "library:write"), null);
  });

  it("rejects a token the verifier refuses without reading the database, and one whose user is gone", async () => {
    globalThis.__stubSession = null;
    globalThis.__stubJwt = null;
    globalThis.__stubDb = () => {
      throw new Error("the database must not be read");
    };
    assert.equal(await getAuthenticatedUser(jwt, "library:read"), null);
    verified(["library:read"]);
    userRow(undefined);
    assert.equal(await getAuthenticatedUser(jwt, "library:read"), null, "a verified token for a deleted user");
  });

  it("still returns a blocked user, as it does for opaque tokens: the routes refuse them", async () => {
    globalThis.__stubSession = null;
    verified(["library:read"]);
    userRow({ ...member, blockedAt: new Date() });
    assert.ok((await getAuthenticatedUser(jwt, "library:read"))?.user.blockedAt);
  });

  it("never sends an opaque token to the JWT verifier", async () => {
    globalThis.__stubSession = null;
    globalThis.__jwtCalls = 0;
    verified(["library:read"]);
    userRow(undefined);
    assert.equal(await getAuthenticatedUser(request("kJ3x9QwY2LmN8aBcDeFgHiJkLmNoPqRs"), "library:read"), null);
    assert.equal(globalThis.__jwtCalls, 0);
  });
});
