import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => { throw new Error('db must not be reached'); };", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const buildFirstApplication = {};", shortCircuit: true };
    }
    if (specifier === "@/lib/build-first") return next("./build-first.ts", { ...context, parentURL: ${JSON.stringify(new URL("../../../../lib/build-first.ts", import.meta.url).href)} });
    return next(specifier, context);
  }`,
  import.meta.url,
);

function post(body: string) {
  return new Request("http://localhost/api/build-first/apply", { method: "POST", body });
}

describe("build first apply route", () => {
  it("rejects invalid JSON before touching the database", async () => {
    const { POST } = await import("./route.ts");
    const res = await POST(post("{not json"));
    assert.equal(res.status, 400);
  });

  it("rejects an invalid application with field errors and without touching the database", async () => {
    const { POST } = await import("./route.ts");
    const res = await POST(post(JSON.stringify({ email: "nope" })));
    assert.equal(res.status, 400);
    const json = (await res.json()) as { fieldErrors: Record<string, string> };
    assert.ok(json.fieldErrors.email);
  });

  it("rejects oversized bodies", async () => {
    const { POST } = await import("./route.ts");
    const res = await POST(post("x".repeat(20_001)));
    assert.equal(res.status, 413);
  });

  it("silently accepts honeypot submissions without storing them", async () => {
    const { POST } = await import("./route.ts");
    const res = await POST(post(JSON.stringify({ companyFax: "spam" })));
    assert.equal(res.status, 201);
  });

  it("waitlists applications once 100 builds run in parallel", async () => {
    const { isWaitlisted } = await import("./route.ts");
    assert.equal(isWaitlisted(99), false);
    assert.equal(isWaitlisted(100), true);
  });
});
