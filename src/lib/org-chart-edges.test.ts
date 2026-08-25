import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildChartEdges, hasAntiParallelPair } from "./org-chart-edges.ts";

describe("buildChartEdges", () => {
  it("builds a report edge for every role with a reports_to parent", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
      { id: "b", reports_to: "boss" },
    ];
    const edges = buildChartEdges(roles, []);
    assert.equal(edges.length, 2);
    assert.deepEqual(
      edges.map((e) => [e.from, e.to, e.type]).sort(),
      [
        ["boss", "a", "report"],
        ["boss", "b", "report"],
      ].sort(),
    );
  });

  it("excludes a role that reports to itself", () => {
    const roles = [{ id: "loop", reports_to: "loop" }];
    const edges = buildChartEdges(roles, []);
    assert.equal(edges.length, 0);
  });

  it("concatenates communication edges after report edges, in order", () => {
    const roles = [
      { id: "boss", reports_to: null },
      { id: "a", reports_to: "boss" },
    ];
    const communication = [{ from: "boss", to: "a", type: "command" as const }];
    const edges = buildChartEdges(roles, communication);
    assert.equal(edges.length, 2);
    assert.equal(edges[0].type, "report");
    assert.equal(edges[1].type, "command");
  });
});

describe("hasAntiParallelPair", () => {
  it("returns true when both A→B and B→A exist", () => {
    const edges = [
      { from: "a", to: "b", type: "command" as const },
      { from: "b", to: "a", type: "feedback" as const },
    ];
    assert.equal(hasAntiParallelPair(edges, "a", "b"), true);
  });

  it("returns false when only one direction exists", () => {
    const edges = [{ from: "a", to: "b", type: "command" as const }];
    assert.equal(hasAntiParallelPair(edges, "a", "b"), false);
  });
});
