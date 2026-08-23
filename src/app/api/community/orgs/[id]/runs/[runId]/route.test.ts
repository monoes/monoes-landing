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
      return { url: "data:text/javascript,export const orgRun = {};", shortCircuit: true };
    }
    if (specifier === "@/lib/community/can-delete-org-run") {
      return { url: "data:text/javascript,export const canDeleteOrgRun = () => true;", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("run deletion route module", () => {
  it("exports a DELETE handler", async () => {
    const mod = await import("./route.ts");
    assert.equal(typeof mod.DELETE, "function");
  });
});
