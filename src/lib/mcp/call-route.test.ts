import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { callJsonRoute, callFormRoute } from "./call-route.ts";

describe("callJsonRoute", () => {
  it("builds a GET request with no body and no content-type header", async () => {
    let seen: Request | null = null;
    const handler = async (request: Request) => {
      seen = request;
      return Response.json({ ok: true });
    };
    const result = await callJsonRoute(handler, { method: "GET", url: "http://localhost/api/community/feed", authHeader: null });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { ok: true });
    assert.equal(seen!.method, "GET");
    assert.equal(seen!.headers.get("content-type"), null);
  });

  it("attaches the Authorization header when provided", async () => {
    let seenAuth: string | null = null;
    const handler = async (request: Request) => {
      seenAuth = request.headers.get("authorization");
      return Response.json({});
    };
    await callJsonRoute(handler, { method: "POST", url: "http://localhost/x", authHeader: "Bearer abc123", json: {} });
    assert.equal(seenAuth, "Bearer abc123");
  });

  it("sends the json option as a serialized body with content-type set", async () => {
    let seenBody: unknown = null;
    let seenContentType: string | null = null;
    const handler = async (request: Request) => {
      seenBody = await request.json();
      seenContentType = request.headers.get("content-type");
      return Response.json({});
    };
    await callJsonRoute(handler, { method: "POST", url: "http://localhost/x", authHeader: null, json: { title: "hi" } });
    assert.deepEqual(seenBody, { title: "hi" });
    assert.equal(seenContentType, "application/json");
  });

  it("passes params through as a resolved promise for [id] routes", async () => {
    let seenParams: Record<string, string> | null = null;
    const handler = async (_request: Request, ctx: { params: Promise<Record<string, string>> }) => {
      seenParams = await ctx.params;
      return Response.json({});
    };
    await callJsonRoute(handler, {
      method: "POST",
      url: "http://localhost/x",
      authHeader: null,
      json: { value: 1 },
      params: { id: "feat-1" },
    });
    assert.deepEqual(seenParams, { id: "feat-1" });
  });

  it("returns body: null when the response is not valid JSON", async () => {
    const handler = async () => new Response("not json", { status: 500 });
    const result = await callJsonRoute(handler, { method: "GET", url: "http://localhost/x", authHeader: null });
    assert.equal(result.status, 500);
    assert.equal(result.body, null);
  });
});

describe("callFormRoute", () => {
  it("builds multipart form data with fields and files, and forwards params + auth", async () => {
    let seenFields: { label: string | null; fileCount: number; firstFileName: string | null } | null = null;
    let seenAuth: string | null = null;
    let seenParams: Record<string, string> | null = null;
    const handler = async (request: Request, ctx: { params: Promise<Record<string, string>> }) => {
      seenAuth = request.headers.get("authorization");
      seenParams = await ctx.params;
      const formData = await request.formData();
      const files = formData.getAll("files").filter((f): f is File => f instanceof File);
      seenFields = {
        label: formData.get("label") as string | null,
        fileCount: files.length,
        firstFileName: files[0]?.name ?? null,
      };
      return Response.json({ id: "run-1" }, { status: 201 });
    };

    const result = await callFormRoute(handler, {
      url: "http://localhost/api/community/orgs/org-1/runs",
      authHeader: "Bearer tok",
      fields: { label: "Test run" },
      files: [{ fieldName: "files", filename: "notes.md", content: "# hi", mimeType: "text/markdown" }],
      params: { id: "org-1" },
    });

    assert.equal(result.status, 201);
    assert.deepEqual(result.body, { id: "run-1" });
    assert.equal(seenAuth, "Bearer tok");
    assert.deepEqual(seenParams, { id: "org-1" });
    assert.deepEqual(seenFields, { label: "Test run", fileCount: 1, firstFileName: "notes.md" });
  });
});
