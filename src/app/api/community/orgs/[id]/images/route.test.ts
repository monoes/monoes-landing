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
      return next("../../../../../../lib/community/can-edit-org-upload.ts", context);
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
    if (specifier === "@opennextjs/cloudflare") {
      return { url: "data:text/javascript,export const getCloudflareContext = () => globalThis.__stubCloudflareContext();", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { POST, isValidImageContentType, isValidImageSize } = await import("./route.ts");

function ctx() {
  return { params: Promise.resolve({ id: "org-1" }) };
}

function stubDb(orgRow) {
  globalThis.__stubDb = () => ({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => (orgRow ? [orgRow] : []) }) }) }),
  });
}

function reqWithImage(file) {
  const formData = new FormData();
  if (file) formData.append("image", file);
  return new Request("http://localhost/api/community/orgs/org-1/images", { method: "POST", body: formData });
}

describe("image upload validation", () => {
  it("isValidImageContentType accepts png/jpeg/webp only", () => {
    assert.equal(isValidImageContentType("image/png"), true);
    assert.equal(isValidImageContentType("image/jpeg"), true);
    assert.equal(isValidImageContentType("image/webp"), true);
    assert.equal(isValidImageContentType("image/gif"), false);
  });

  it("isValidImageSize accepts up to 2MB, rejects larger or empty", () => {
    const twoMb = 2 * 1024 * 1024;
    assert.equal(isValidImageSize(0), false);
    assert.equal(isValidImageSize(twoMb), true);
    assert.equal(isValidImageSize(twoMb + 1), false);
  });
});

describe("POST /api/community/orgs/[id]/images", () => {
  it("returns 401 when unauthenticated", async () => {
    globalThis.__stubSession = null;
    const res = await POST(reqWithImage(null), ctx());
    assert.equal(res.status, 401);
  });

  it("returns 404 when the org doesn't exist", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    stubDb(null);
    const res = await POST(reqWithImage(null), ctx());
    assert.equal(res.status, 404);
  });

  it("returns 403 when the caller isn't the owner", async () => {
    globalThis.__stubSession = { user: { id: "u2", role: "member", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const res = await POST(reqWithImage(null), ctx());
    assert.equal(res.status, 403);
  });

  it("returns 400 when no image file is provided", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const res = await POST(reqWithImage(null), ctx());
    assert.equal(res.status, 400);
  });

  it("returns 400 for an unsupported content type", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const file = new File(["gif-bytes"], "pic.gif", { type: "image/gif" });
    const res = await POST(reqWithImage(file), ctx());
    assert.equal(res.status, 400);
  });

  it("uploads a valid image to ORG_FILES under org-body-images/<orgId>/ and returns its URL", async () => {
    globalThis.__stubSession = { user: { id: "u1", role: "member", blockedAt: null } };
    stubDb({ uploaderId: "u1" });
    const putMock = mock.fn(async () => {});
    globalThis.__stubCloudflareContext = () => ({ env: { ORG_FILES: { put: putMock } } });

    const file = new File(["png-bytes"], "pic.png", { type: "image/png" });
    const res = await POST(reqWithImage(file), ctx());

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.match(json.url, /^\/api\/images\/org\/org-body-images\/org-1\/[a-f0-9-]+\.png$/);
    assert.equal(putMock.mock.calls.length, 1);
    const [key] = putMock.mock.calls[0].arguments;
    assert.match(key, /^org-body-images\/org-1\//);
  });
});
