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
      return { url: "data:text/javascript,export const user = {};", shortCircuit: true };
    }
    if (specifier === "@opennextjs/cloudflare") {
      return { url: "data:text/javascript,export const getCloudflareContext = () => ({ env: {} });", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("avatar upload validation", () => {
  it("isValidAvatarContentType accepts png/jpeg/webp only", async () => {
    const { isValidAvatarContentType } = await import("./route.ts");
    assert.equal(isValidAvatarContentType("image/png"), true);
    assert.equal(isValidAvatarContentType("image/jpeg"), true);
    assert.equal(isValidAvatarContentType("image/webp"), true);
    assert.equal(isValidAvatarContentType("image/gif"), false);
    assert.equal(isValidAvatarContentType("application/json"), false);
  });

  it("isValidAvatarSize accepts up to 2MB, rejects larger", async () => {
    const { isValidAvatarSize } = await import("./route.ts");
    const twoMb = 2 * 1024 * 1024;
    assert.equal(isValidAvatarSize(0), false);
    assert.equal(isValidAvatarSize(twoMb), true);
    assert.equal(isValidAvatarSize(twoMb + 1), false);
    assert.equal(isValidAvatarSize(1024), true);
  });
});
