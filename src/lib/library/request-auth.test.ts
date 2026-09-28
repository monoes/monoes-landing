import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// requireUser only depends on getRequestAuth; stub it with whatever the test sets.
register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/community/get-authenticated-user") {
      return { url: "data:text/javascript,export const getRequestAuth = async () => globalThis.__stubSession;", shortCircuit: true };
    }
    if (specifier === "./types") return next("./types.ts", context);
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { requireUser, LOGIN_REQUIRED } = await import("./request-auth.ts");
const { LibraryError } = await import("./types.ts");

const member = { id: "u1", username: "someone", role: "member", blockedAt: null };
const req = new Request("http://localhost/api/library/items");

async function statusOf(p: Promise<unknown>): Promise<{ status: number; code: string; message: string } | "ok"> {
  try {
    await p;
    return "ok";
  } catch (err) {
    assert.ok(err instanceof LibraryError);
    return { status: err.status, code: err.code, message: err.message };
  }
}

describe("requireUser (every library read and write)", () => {
  it("rejects anonymous callers with 401 and the log-in message", async () => {
    globalThis.__stubSession = null;
    assert.deepEqual(await statusOf(requireUser(req, "library:read")), {
      status: 401,
      code: "unauthorized",
      message: "Log in to monoes.me to browse the library",
    });
    assert.equal(LOGIN_REQUIRED, "Log in to monoes.me to browse the library");
  });

  it("accepts a web session (no token scopes) and a token with library:read", async () => {
    globalThis.__stubSession = { user: member, scopes: null };
    assert.equal(await statusOf(requireUser(req, "library:read")), "ok");
    globalThis.__stubSession = { user: member, scopes: ["library:read"] };
    assert.equal(await statusOf(requireUser(req, "library:read")), "ok");
  });

  it("refuses a token without library:read (403 insufficient_scope) and blocked accounts", async () => {
    globalThis.__stubSession = { user: member, scopes: ["community:read"] };
    assert.deepEqual(await statusOf(requireUser(req, "library:read")), {
      status: 403,
      code: "insufficient_scope",
      message: "This token needs the library:read scope.",
    });
    globalThis.__stubSession = { user: { ...member, blockedAt: new Date() }, scopes: null };
    assert.equal((await statusOf(requireUser(req, "library:read")) as { status: number }).status, 403);
  });
});
