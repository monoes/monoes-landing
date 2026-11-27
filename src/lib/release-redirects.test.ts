import { describe, it } from "node:test";
import assert from "node:assert/strict";
import pathToRegexp from "next/dist/compiled/path-to-regexp/index.js";
import { releaseRedirects } from "./release-redirects.ts";

const DOWNLOAD = "https://github.com/monoes/mono-agent/releases/latest/download";

// Where Next sends `path`, matching the sources as it does; null when no redirect takes it.
function destinationOf(path: string): string | null {
  for (const rule of releaseRedirects) {
    const found = pathToRegexp.match(rule.source, { strict: true })(path);
    if (!found) continue;
    const params = found.params as Record<string, string>;
    return rule.destination.replace(/:file\b/, params.file ?? "");
  }
  return null;
}

describe("mono-agent release addresses", () => {
  it("serves the signed manifest and its signatures, which install.sh and `update` ask for", () => {
    for (const file of ["manifest.json", "manifest.json.sig", "manifest.json.sshsig"]) {
      assert.equal(destinationOf(`/mono-agent/releases/latest/${file}`), `${DOWNLOAD}/${file}`);
    }
  });

  it("serves every kind of release file", () => {
    for (const file of [
      "monoagentcli-linux-amd64",
      "monoagentcli-windows-amd64.exe",
      "MonoAgent-darwin-arm64.zip",
      "MonoAgent-linux-amd64.tar.gz",
      "monoagent-chrome-extension.zip",
      "SHA256SUMS.txt",
      "NOTICE",
    ]) {
      assert.equal(destinationOf(`/mono-agent/releases/latest/${file}`), `${DOWNLOAD}/${file}`);
    }
  });

  it("sends the bare address to the latest release page", () => {
    assert.equal(destinationOf("/mono-agent/releases/latest"), "https://github.com/monoes/mono-agent/releases/latest");
  });

  it("takes nothing but one plain file name", () => {
    for (const path of [
      "/mono-agent/releases/latest/..",
      "/mono-agent/releases/latest/.hidden",
      "/mono-agent/releases/latest/a/b",
      "/mono-agent/releases/latest/%2e%2e",
      "/mono-agent/releases/latest/x%2F..",
      "/mono-agent/releases/v1.0.0/manifest.json",
    ]) {
      assert.equal(destinationOf(path), null, path);
    }
  });

  // A permanent redirect would be cached and keep pointing at an old release.
  it("is temporary", () => {
    for (const rule of releaseRedirects) assert.equal(rule.permanent, false, rule.source);
  });
});
