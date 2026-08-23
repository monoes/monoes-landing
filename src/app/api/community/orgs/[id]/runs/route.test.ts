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
      return {
        url: "data:text/javascript,export const orgUpload = {}; export const orgRun = {}; export const orgRunFile = {};",
        shortCircuit: true,
      };
    }
    if (specifier === "@opennextjs/cloudflare") {
      return { url: "data:text/javascript,export const getCloudflareContext = () => ({ env: {} });", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

describe("run upload validation", () => {
  it("getFileType accepts .md and .html case-insensitively, rejects everything else", async () => {
    const { getFileType } = await import("./route.ts");
    assert.equal(getFileType("report.md"), "md");
    assert.equal(getFileType("REPORT.MD"), "md");
    assert.equal(getFileType("output.html"), "html");
    assert.equal(getFileType("output.HTML"), "html");
    assert.equal(getFileType("data.csv"), null);
    assert.equal(getFileType("noextension"), null);
    assert.equal(getFileType("report.html.txt"), null);
  });

  it("isValidRunLabel accepts empty and up to 100 chars, rejects longer", async () => {
    const { isValidRunLabel } = await import("./route.ts");
    assert.equal(isValidRunLabel(""), true);
    assert.equal(isValidRunLabel("a".repeat(100)), true);
    assert.equal(isValidRunLabel("a".repeat(101)), false);
  });

  it("sanitizeFilename strips path separators and control characters, preserves extension", async () => {
    const { sanitizeFilename } = await import("./route.ts");
    assert.equal(sanitizeFilename("../../etc/passwd.md"), "etc-passwd.md");
    assert.equal(sanitizeFilename("report.md"), "report.md");
    assert.equal(sanitizeFilename("my report (final).html"), "my report (final).html");
  });

  it("sanitizeFilename truncates names longer than 150 characters while preserving the extension", async () => {
    const { sanitizeFilename } = await import("./route.ts");
    const longName = "a".repeat(200) + ".md";
    const result = sanitizeFilename(longName);
    assert.ok(result.length <= 150);
    assert.ok(result.endsWith(".md"));
  });
});
