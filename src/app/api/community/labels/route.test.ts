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
      return { url: "data:text/javascript,export const bugLabel = {};", shortCircuit: true };
    }
    if (specifier === "@/lib/community/is-moderator") {
      return { url: "data:text/javascript,export const isModerator = () => true;", shortCircuit: true };
    }
    if (specifier === "drizzle-orm") {
      return { url: "data:text/javascript,export const eq = () => {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("label validation", () => {
  it("rejects empty label names", async () => {
    const { isValidLabelName } = await import("./route.ts");
    assert.equal(isValidLabelName(""), false);
  });

  it("rejects label names longer than 30 characters", async () => {
    const { isValidLabelName } = await import("./route.ts");
    assert.equal(isValidLabelName("a".repeat(31)), false);
  });

  it("accepts a reasonable label name", async () => {
    const { isValidLabelName } = await import("./route.ts");
    assert.equal(isValidLabelName("regression"), true);
  });

  it("isValidLabelColor accepts a 6-digit hex color", async () => {
    const { isValidLabelColor } = await import("./route.ts");
    assert.equal(isValidLabelColor("#e11d48"), true);
  });

  it("isValidLabelColor rejects non-hex strings", async () => {
    const { isValidLabelColor } = await import("./route.ts");
    assert.equal(isValidLabelColor("red"), false);
    assert.equal(isValidLabelColor("#zzz"), false);
    assert.equal(isValidLabelColor("#abc"), false);
  });
});
