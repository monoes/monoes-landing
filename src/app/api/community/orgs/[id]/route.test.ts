import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/community/get-authenticated-user") {
      return { url: "data:text/javascript,export const getAuthenticatedUser = async () => globalThis.__stubSession;", shortCircuit: true };
    }
    if (specifier === "@/lib/community/can-edit-org-upload") {
      return next("../../../../../lib/community/can-edit-org-upload.ts", context);
    }
    if (specifier === "@/lib/community/can-delete-org-upload") {
      return next("../../../../../lib/community/can-delete-org-upload.ts", context);
    }
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => globalThis.__stubDb();", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const orgUpload = {};", shortCircuit: true };
    }
    if (specifier === "drizzle-orm") {
      return { url: "data:text/javascript,export const eq = () => {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { PATCH, isValidName, isValidTagline, isValidDescription, isValidBody } = await import("./route.ts");

function req(body) {
  return new Request("http://localhost/api/community/orgs/org-1", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

function ctx() {
  return { params: Promise.resolve({ id: "org-1" }) };
}

function stubDb(orgRow) {
  const setMock = mock.fn(() => ({ where: async () => {} }));
  globalThis.__stubDb = () => ({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => (orgRow ? [orgRow] : []) }) }) }),
    update: () => ({ set: setMock }),
  });
  return setMock;
}

describe("validators", () => {
  it("isValidName rejects empty and over-100-char names", () => {
    assert.equal(isValidName(""), false);
    assert.equal(isValidName("a".repeat(101)), false);
    assert.equal(isValidName("My Org"), true);
  });

  it("isValidTagline rejects over-150-char taglines, allows empty", () => {
    assert.equal(isValidTagline("a".repeat(151)), false);
    assert.equal(isValidTagline(""), true);
  });

  it("isValidDescription rejects over-1000-char descriptions", () => {
    assert.equal(isValidDescription("a".repeat(1001)), false);
    assert.equal(isValidDescription("a".repeat(1000)), true);
  });

  it("isValidBody rejects over-20000-char bodies", () => {
    assert.equal(isValidBody("a".repeat(20001)), false);
    assert.equal(isValidBody("a".repeat(20000)), true);
  });
});

describe("PATCH /api/community/orgs/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    globalThis.__stubSession = null;
    const res = await PATCH(req({ name: "New name" }), ctx());
    assert.equal(res.status, 401);
  });

  it("returns 403 when the account is blocked", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: new Date() } };
    const res = await PATCH(req({ name: "New name" }), ctx());
    assert.equal(res.status, 403);
  });

  it("returns 404 when the org doesn't exist", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    stubDb(null);
    const res = await PATCH(req({ name: "New name" }), ctx());
    assert.equal(res.status, 404);
  });

  it("returns 403 when the caller isn't the owner (or admin/moderator)", async () => {
    globalThis.__stubSession = { user: { id: "u2", role: "member", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const res = await PATCH(req({ name: "New name" }), ctx());
    assert.equal(res.status, 403);
  });

  it("returns 400 when a field fails validation", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const res = await PATCH(req({ tagline: "a".repeat(151) }), ctx());
    assert.equal(res.status, 400);
  });

  it("returns 400 when no valid fields are provided", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const res = await PATCH(req({}), ctx());
    assert.equal(res.status, 400);
  });

  it("updates only the provided fields for the owner", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    const setMock = stubDb({ uploaderId: "u1" });
    const res = await PATCH(req({ tagline: "Short and sweet" }), ctx());
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.deepEqual(json, { id: "org-1", tagline: "Short and sweet" });
    assert.deepEqual(setMock.mock.calls[0].arguments[0], { tagline: "Short and sweet" });
  });

  it("allows a moderator to edit someone else's org", async () => {
    globalThis.__stubSession = { user: { id: "u2", role: "moderator", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const res = await PATCH(req({ name: "Renamed" }), ctx());
    assert.equal(res.status, 200);
  });
});
