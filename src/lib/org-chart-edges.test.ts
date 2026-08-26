import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildChartEdges } from "./org-chart-edges.ts";

describe("buildChartEdges", () => {
  it("auto-generates a command+report pair from each role to its manager when there is no explicit communication", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
      { id: "b", reports_to: "boss" },
    ];
    const edges = buildChartEdges(roles, []);
    assert.equal(edges.length, 4);
    assert.deepEqual(
      edges.map((e) => [e.from, e.to, e.type]).sort(),
      [
        ["a", "boss", "report"],
        ["b", "boss", "report"],
        ["boss", "a", "command"],
        ["boss", "b", "command"],
      ].sort(),
    );
  });

  it("falls back to the leader when a role's reports_to points at itself", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "loop", reports_to: "loop" },
    ];
    const edges = buildChartEdges(roles, []);
    assert.deepEqual(
      edges.map((e) => [e.from, e.to, e.type]).sort(),
      [
        ["boss", "loop", "command"],
        ["loop", "boss", "report"],
      ].sort(),
    );
  });

  it("returns nothing auto-generated for a single-role org", () => {
    const roles = [{ id: "solo", reports_to: null }];
    assert.equal(buildChartEdges(roles, []).length, 0);
  });

  it("uses explicit communication verbatim instead of auto-generating reports_to edges", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
    ];
    const communication = [{ from: "boss", to: "a", type: "command" as const }];
    const edges = buildChartEdges(roles, communication);
    assert.deepEqual(edges, communication);
  });
});
