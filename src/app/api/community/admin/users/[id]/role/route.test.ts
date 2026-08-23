import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// Same module-resolution problem Tasks 6-7 hit: plain `node --test` can't
// resolve the bare "next/server" specifier, and `@/lib/auth` / `@/lib/db` /
// `@/lib/db/schema` transitively pull in better-auth, the D1 Drizzle
// adapter, and `@opennextjs/cloudflare`'s `getCloudflareContext` — none of
// which run outside a Next.js/wrangler runtime. This hook, scoped to this
// test file only via module.register(), redirects "next/server" to its real
// file and swaps the app's own auth/db modules for inline stubs so this
// route's unmodified imports resolve here without touching production code.
register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const getAuth = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/community/get-authenticated-user") {
      return { url: "data:text/javascript,export const getAuthenticatedUser = async () => null;", shortCircuit: true };
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

describe("role validation", () => {
  it("isValidRole accepts member, moderator, admin only", async () => {
    const { isValidRole } = await import("./route.ts");
    assert.equal(isValidRole("member"), true);
    assert.equal(isValidRole("moderator"), true);
    assert.equal(isValidRole("admin"), true);
    assert.equal(isValidRole("superuser"), false);
  });
});
