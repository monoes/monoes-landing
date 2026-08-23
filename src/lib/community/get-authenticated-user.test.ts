import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const getAuth = () => ({ api: { getSession: async () => globalThis.__stubSession } });", shortCircuit: true };
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

const { getAuthenticatedUser } = await import("./get-authenticated-user.ts");

function selectChain(rows) {
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
