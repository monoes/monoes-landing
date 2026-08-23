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
      return { url: "data:text/javascript,export const bug = {}; export const bugComment = {}; export const user = {};", shortCircuit: true };
    }
    if (specifier === "drizzle-orm") {
      return { url: "data:text/javascript,export const eq = () => {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("comment body validation", () => {
  it("rejects empty comment bodies", async () => {
    const { isValidCommentBody } = await import("./route.ts");
    assert.equal(isValidCommentBody(""), false);
  });

  it("rejects comment bodies longer than 1000 characters", async () => {
    const { isValidCommentBody } = await import("./route.ts");
    assert.equal(isValidCommentBody("a".repeat(1001)), false);
  });

  it("accepts a reasonable comment body", async () => {
    const { isValidCommentBody } = await import("./route.ts");
    assert.equal(isValidCommentBody("I can reproduce this on Firefox too."), true);
  });
});
