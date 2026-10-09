import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

// scripts/generate-signing-key.ts is piped into `wrangler secret put`: stdout must be the private
// JWK and nothing else, and the pin for the client must be on stderr, never on stdout.
describe("scripts/generate-signing-key.ts", () => {
  const run = spawnSync("node_modules/.bin/tsx", ["scripts/generate-signing-key.ts"], { encoding: "utf8" });
  const stdout = run.stdout;
  const stderr = run.stderr;

  it("prints the private JWK as one line of JSON on stdout, and only that", () => {
    assert.equal(run.status, 0, stderr);
    assert.ok(stdout.endsWith("\n") && stdout.trim().split("\n").length === 1);
    const jwk = JSON.parse(stdout);
    assert.deepEqual(Object.keys(jwk), ["kty", "crv", "x", "d"]);
    assert.equal(jwk.kty, "OKP");
    assert.equal(jwk.crv, "Ed25519");
    const msg = Buffer.from("self-check");
    const pub = createPublicKey({ key: { kty: jwk.kty, crv: jwk.crv, x: jwk.x }, format: "jwk" });
    assert.ok(verify(null, msg, pub, sign(null, msg, createPrivateKey({ key: jwk, format: "jwk" }))));
  });

  it("prints the kid (RFC 7638), the 64-hex public key and the public JWK on stderr, never the private part", () => {
    const jwk = JSON.parse(stdout);
    const kid = createHash("sha256").update(`{"crv":"Ed25519","kty":"OKP","x":"${jwk.x}"}`).digest("base64url");
    assert.equal(kid.length, 43);
    assert.ok(stderr.includes(`kid        : ${kid}\n`));
    assert.ok(stderr.includes(`public hex : ${Buffer.from(jwk.x, "base64url").toString("hex")} `));
    assert.ok(stderr.includes(`public JWK : {"kty":"OKP","crv":"Ed25519","x":"${jwk.x}"}`));
    assert.ok(!stderr.includes(jwk.d) && !stdout.includes("kid"));
  });
});
