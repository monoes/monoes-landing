import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { withFixedLength } from "./fixed-length.ts";

// Stand-in for workerd's FixedLengthStream: a pass-through that records the length.
const lengths: number[] = [];
class FakeFixedLengthStream extends TransformStream {
  constructor(length: number) {
    super();
    lengths.push(length);
  }
}

describe("withFixedLength", () => {
  it("re-streams hinted responses at a fixed length and drops the hint", async () => {
    const original = new Response("hello", {
      status: 200,
      headers: { "X-Content-Length": "5", "Content-Length": "5", "X-Content-SHA256": "abc" },
    });
    const out = withFixedLength(original, FakeFixedLengthStream);
    assert.notEqual(out, original);
    assert.equal(lengths.at(-1), 5);
    assert.equal(out.headers.get("X-Content-Length"), null);
    assert.equal(out.headers.get("X-Content-SHA256"), "abc");
    assert.equal(await out.text(), "hello");
  });

  it("leaves other responses alone", () => {
    const plain = new Response("x");
    assert.equal(withFixedLength(plain, FakeFixedLengthStream), plain);
    const bad = new Response("x", { headers: { "X-Content-Length": "-1" } });
    assert.equal(withFixedLength(bad, FakeFixedLengthStream), bad);
    const hinted = new Response("x", { headers: { "X-Content-Length": "1" } });
    assert.equal(withFixedLength(hinted, undefined), hinted, "outside workerd there is no FixedLengthStream");
  });
});
