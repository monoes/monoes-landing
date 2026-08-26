import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeLayout } from "./org-layout.ts";

describe("computeLayout", () => {
  it("returns no positions for an empty role list", () => {
    const result = computeLayout([], undefined, "hierarchical");
    assert.deepEqual(Object.keys(result.positions), []);
  });

  it("places a single role at the top center regardless of topology", () => {
    const roles = [{ id: "boss", reports_to: null }];
    const result = computeLayout(roles, undefined, "hierarchical");
    assert.equal(result.positions.boss.x, 360);
    assert.equal(result.positions.boss.y, 90);
  });

  it("places the leader above and non-leaders on a row below it (hub-and-spoke default)", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
      { id: "b", reports_to: "boss" },
    ];
    const result = computeLayout(roles, undefined, "hierarchical");
    const boss = result.positions.boss;
    const a = result.positions.a;
    const b = result.positions.b;
    assert.ok(boss.y < a.y);
    assert.ok(boss.y < b.y);
    // Both non-leader roles sit on the same row.
    assert.equal(a.y, b.y);
  });

  it("evenly spaces all roles around a circle for mesh topology", () => {
    const roles = [
      { id: "a", reports_to: null },
      { id: "b", reports_to: null },
      { id: "c", reports_to: null },
      { id: "d", reports_to: null },
    ];
    const result = computeLayout(roles, undefined, "mesh");
    const pts = Object.values(result.positions);
    const center = {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
    const distances = pts.map((n) => Math.hypot(n.x - center.x, n.y - center.y));
    for (const d of distances) {
      assert.ok(Math.abs(d - distances[0]) < 0.01);
    }
  });

  it("lines roles up horizontally for ring/pipeline topology", () => {
    const roles = [
      { id: "a", reports_to: null },
      { id: "b", reports_to: "a" },
      { id: "c", reports_to: "b" },
    ];
    const result = computeLayout(roles, undefined, "pipeline");
    assert.equal(result.positions.a.y, 90);
    assert.equal(result.positions.b.y, 90);
    assert.equal(result.positions.c.y, 90);
    assert.ok(result.positions.a.x < result.positions.b.x);
    assert.ok(result.positions.b.x < result.positions.c.x);
  });

  it("layers roles by BFS depth over explicit communication edges", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "mid", reports_to: "boss" },
      { id: "leaf", reports_to: "mid" },
    ];
    const communication = [
      { from: "boss", to: "mid", type: "command" },
      { from: "mid", to: "leaf", type: "command" },
    ];
    const result = computeLayout(roles, communication, "hierarchical");
    assert.ok(result.positions.boss.y < result.positions.mid.y);
    assert.ok(result.positions.mid.y < result.positions.leaf.y);
  });

  it("falls back to hub-and-spoke when the only communication edges are 'report' type", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
    ];
    const communication = [{ from: "a", to: "boss", type: "report" }];
    const result = computeLayout(roles, communication, "hierarchical");
    assert.ok(result.positions.boss.y < result.positions.a.y);
  });

  it("treats a missing/unknown topology as hierarchical (hub-and-spoke)", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "mid", reports_to: "boss" },
    ];
    const result = computeLayout(roles, undefined, undefined);
    assert.ok(result.positions.boss.y < result.positions.mid.y);
  });

  it("re-flows 8+ roles into a serpentine grid of at most 6 per row", () => {
    const roles = [
      { id: "boss", reports_to: null },
      ...Array.from({ length: 8 }, (_, i) => ({ id: `c${i}`, reports_to: "boss" })),
    ];
    const result = computeLayout(roles, undefined, "hierarchical");
    const rows = new Set(Object.values(result.positions).map((p) => p.y));
    // 9 roles at a max of 6 per row must split into more than one row.
    assert.ok(rows.size > 1);
  });

  it("uses a smaller node radius once an org is crowded (5+ roles)", () => {
    const small = computeLayout(
      [
        { id: "boss", reports_to: null },
        { id: "a", reports_to: "boss" },
      ],
      undefined,
      "hierarchical",
    );
    const crowded = computeLayout(
      [
        { id: "boss", reports_to: null },
        { id: "a", reports_to: "boss" },
        { id: "b", reports_to: "boss" },
        { id: "c", reports_to: "boss" },
        { id: "d", reports_to: "boss" },
      ],
      undefined,
      "hierarchical",
    );
    assert.ok(crowded.nodeRadius < small.nodeRadius);
  });

  it("handles a role id that collides with Object.prototype property names", () => {
    const roles = [
      { id: "constructor", reports_to: null },
      { id: "child", reports_to: "constructor" },
    ];
    const result = computeLayout(roles, undefined, "hierarchical");
    assert.ok(result.positions.constructor);
    assert.ok(result.positions.child);
  });
});
