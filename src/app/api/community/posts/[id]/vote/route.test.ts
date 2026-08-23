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
      return { url: "data:text/javascript,export const post = {}; export const postVote = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("post vote value validation", () => {
  it("isValidVoteValue accepts 1, -1, and 0 only", async () => {
    const { isValidVoteValue } = await import("./route.ts");
    assert.equal(isValidVoteValue(1), true);
    assert.equal(isValidVoteValue(-1), true);
    assert.equal(isValidVoteValue(0), true);
    assert.equal(isValidVoteValue(2), false);
    assert.equal(isValidVoteValue("1"), false);
  });
});
