import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

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
      return { url: "data:text/javascript,export const bugComment = {};", shortCircuit: true };
    }
    if (specifier === "drizzle-orm") {
      return { url: "data:text/javascript,export const eq = () => {}; export const and = () => {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("comment delete authorization", () => {
  it("canDeleteComment allows the comment's own author", async () => {
    const { canDeleteComment } = await import("./route.ts");
    assert.equal(canDeleteComment({ id: "u1", role: "member" }, "u1"), true);
  });

  it("canDeleteComment allows moderators regardless of authorship", async () => {
    const { canDeleteComment } = await import("./route.ts");
    assert.equal(canDeleteComment({ id: "u2", role: "moderator" }, "u1"), true);
  });

  it("canDeleteComment allows admins regardless of authorship", async () => {
    const { canDeleteComment } = await import("./route.ts");
    assert.equal(canDeleteComment({ id: "u2", role: "admin" }, "u1"), true);
  });

  it("canDeleteComment rejects a different member who isn't the author", async () => {
    const { canDeleteComment } = await import("./route.ts");
    assert.equal(canDeleteComment({ id: "u2", role: "member" }, "u1"), false);
  });
});
