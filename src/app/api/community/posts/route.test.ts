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
      return { url: "data:text/javascript,export const post = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("post validation", () => {
  it("rejects empty titles", async () => {
    const { isValidTitle } = await import("./route.ts");
    assert.equal(isValidTitle(""), false);
  });

  it("rejects titles longer than 100 characters", async () => {
    const { isValidTitle } = await import("./route.ts");
    assert.equal(isValidTitle("a".repeat(101)), false);
  });

  it("accepts a reasonable title", async () => {
    const { isValidTitle } = await import("./route.ts");
    assert.equal(isValidTitle("Shipped the new avatar upload flow"), true);
  });

  it("rejects empty bodies", async () => {
    const { isValidBody } = await import("./route.ts");
    assert.equal(isValidBody(""), false);
  });

  it("rejects bodies longer than 2000 characters", async () => {
    const { isValidBody } = await import("./route.ts");
    assert.equal(isValidBody("a".repeat(2001)), false);
  });

  it("accepts a reasonable body", async () => {
    const { isValidBody } = await import("./route.ts");
    assert.equal(isValidBody("Just shipped avatar uploads for community profiles."), true);
  });
});
