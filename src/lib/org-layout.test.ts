import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeLayout } from "./org-layout.ts";

describe("computeLayout", () => {
  it("returns no nodes for an empty role list", () => {
    const result = computeLayout([], "hierarchical", 720, 320);
    assert.deepEqual(result.nodes, []);
  });

  it("places a single boss role at the center for star topology", () => {
    const roles = [{ id: "boss", reports_to: null }];
    const result = computeLayout(roles, "star", 720, 320);
    const boss = result.nodes.find((n) => n.id === "boss");
    assert.ok(boss);
    assert.equal(boss!.x, 360);
    assert.equal(boss!.y, 160);
  });

  it("places non-boss roles on a ring around the boss for star topology", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
      { id: "b", reports_to: "boss" },
    ];
    const result = computeLayout(roles, "star", 720, 320);
    const boss = result.nodes.find((n) => n.id === "boss")!;
    const a = result.nodes.find((n) => n.id === "a")!;
    const b = result.nodes.find((n) => n.id === "b")!;
    // Both non-boss nodes should be equidistant from the boss (on the ring).
    const distA = Math.hypot(a.x - boss.x, a.y - boss.y);
    const distB = Math.hypot(b.x - boss.x, b.y - boss.y);
    assert.ok(Math.abs(distA - distB) < 0.01);
  });

  it("evenly spaces all roles around a circle for mesh topology", () => {
    const roles = [
      { id: "a", reports_to: null },
      { id: "b", reports_to: null },
      { id: "c", reports_to: null },
      { id: "d", reports_to: null },
    ];
    const result = computeLayout(roles, "mesh", 720, 320);
    const center = { x: 360, y: 160 };
    const distances = result.nodes.map((n) => Math.hypot(n.x - center.x, n.y - center.y));
    for (const d of distances) {
      assert.ok(Math.abs(d - distances[0]) < 0.01);
    }
  });

  it("layers roles by reports_to depth for hierarchical topology (default)", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "mid", reports_to: "boss" },
      { id: "leaf", reports_to: "mid" },
    ];
    const result = computeLayout(roles, "hierarchical", 720, 320);
    const boss = result.nodes.find((n) => n.id === "boss")!;
    const mid = result.nodes.find((n) => n.id === "mid")!;
    const leaf = result.nodes.find((n) => n.id === "leaf")!;
    // Each layer should be strictly below (greater y than) the previous one.
    assert.ok(boss.y < mid.y);
    assert.ok(mid.y < leaf.y);
  });

  it("builds one edge per role with a reports_to parent", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
      { id: "b", reports_to: "boss" },
    ];
    const result = computeLayout(roles, "hierarchical", 720, 320);
    assert.equal(result.edges.length, 2);
    assert.ok(result.edges.some((e) => e.from === "boss" && e.to === "a"));
    assert.ok(result.edges.some((e) => e.from === "boss" && e.to === "b"));
  });

  it("treats a missing/unknown topology as hierarchical", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "mid", reports_to: "boss" },
    ];
    const result = computeLayout(roles, undefined, 720, 320);
    const boss = result.nodes.find((n) => n.id === "boss")!;
    const mid = result.nodes.find((n) => n.id === "mid")!;
    assert.ok(boss.y < mid.y);
  });

  it("splits a hierarchical layer into multiple visual rows when it exceeds MAX_PER_ROW", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "c1", reports_to: "boss" },
      { id: "c2", reports_to: "boss" },
      { id: "c3", reports_to: "boss" },
      { id: "c4", reports_to: "boss" },
      { id: "c5", reports_to: "boss" },
    ];
    const result = computeLayout(roles, "hierarchical", 720, 320);
    const children = ["c1", "c2", "c3", "c4", "c5"].map((id) => result.nodes.find((n) => n.id === id)!);
    const distinctYs = new Set(children.map((n) => n.y));
    // 5 same-depth children with MAX_PER_ROW=3 (per Math.max(2, Math.min(4, Math.ceil(Math.sqrt(6))))) must split into 2 visual rows (3 + 2), not 1.
    assert.equal(distinctYs.size, 2);
  });

  it("grows viewBoxHeight when hierarchical rows exceed the given height", () => {
    // 6 depth levels (boss -> ... -> depth 5) at ROW_H=100 each needs totalH = PAD*2 (120) + 6*100 = 720,
    // which exceeds a deliberately small height of 200.
    const roles = [
      { id: "r0", reports_to: null },
      { id: "r1", reports_to: "r0" },
      { id: "r2", reports_to: "r1" },
      { id: "r3", reports_to: "r2" },
      { id: "r4", reports_to: "r3" },
      { id: "r5", reports_to: "r4" },
    ];
    const result = computeLayout(roles, "hierarchical", 720, 200);
    assert.ok(result.viewBoxHeight > 200);
  });

  it("does not grow viewBoxHeight when rows fit within the given height", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "mid", reports_to: "boss" },
    ];
    const result = computeLayout(roles, "hierarchical", 720, 320);
    assert.equal(result.viewBoxHeight, 320);
  });

  it("handles a role id that collides with Object.prototype property names", () => {
    const roles = [
      { id: "constructor", reports_to: null },
      { id: "child", reports_to: "constructor" },
    ];
    const result = computeLayout(roles, "hierarchical", 720, 320);
    assert.ok(result.nodes.find((n) => n.id === "constructor"));
    assert.ok(result.nodes.find((n) => n.id === "child"));
  });
});
