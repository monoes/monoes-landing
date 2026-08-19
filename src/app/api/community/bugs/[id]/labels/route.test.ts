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
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const bug = {}; export const bugLabel = {}; export const bugLabelLink = {};", shortCircuit: true };
    }
    if (specifier === "drizzle-orm") {
      return { url: "data:text/javascript,export const eq = () => {}; export const and = () => {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("label id validation", () => {
  it("isValidLabelId rejects an empty string", async () => {
    const { isValidLabelId } = await import("./route.ts");
    assert.equal(isValidLabelId(""), false);
    assert.equal(isValidLabelId(undefined), false);
  });

  it("isValidLabelId accepts a non-empty string", async () => {
    const { isValidLabelId } = await import("./route.ts");
    assert.equal(isValidLabelId("some-uuid"), true);
  });
});
