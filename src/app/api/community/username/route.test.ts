import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// This test only exercises the pure `isValidUsername` helper, but importing
// `./route.ts` still runs its top-level imports. Two classes of problem
// show up, both the same class Task 6 hit with "next/server":
//
// 1. Plain `node --test` can't resolve the bare "next/server" specifier —
//    the installed `next` package has no "exports" map for it (resolves to
//    "next/server.js" instead).
// 2. `@/lib/auth` and `@/lib/db` transitively pull in better-auth, the D1
//    Drizzle adapter, and `@opennextjs/cloudflare`'s `getCloudflareContext`
//    — none of which are meant to run outside a Next.js/wrangler runtime,
//    and whose own internal relative imports (e.g. extensionless
//    "./schema") plain Node ESM can't resolve either.
//
// Rather than trying to make the whole production module graph loadable
// under plain Node (which would mean patching files outside this task's
// scope), this hook — scoped to this test file only via module.register()
// — redirects "next/server" to its real file, and swaps the app's own
// auth/db modules for inline stubs. `src/app/api/community/username/route.ts`
// keeps its standard, unmodified imports; only the test's resolution of
// them is intercepted.
register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const getAuth = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const user = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("username validation", () => {
  it("rejects usernames shorter than 3 characters", async () => {
    const { isValidUsername } = await import("./route.ts");
    assert.equal(isValidUsername("ab"), false);
  });

  it("rejects usernames with invalid characters", async () => {
    const { isValidUsername } = await import("./route.ts");
    assert.equal(isValidUsername("bad name!"), false);
  });

  it("accepts alphanumeric + underscore/hyphen usernames of 3-24 chars", async () => {
    const { isValidUsername } = await import("./route.ts");
    assert.equal(isValidUsername("mono_es-1"), true);
  });
});
