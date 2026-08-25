import type { LayoutRole } from "./org-layout";

export type CommEdge = { from: string; to: string; type: "command" | "report" | "feedback" | "handoff" };

/**
 * Structural report lines come straight from each role's reports_to (the
 * authoritative chain also shown in the Roles tab) — declared communication
 * edges (command/feedback/handoff busses) don't necessarily reflect who
 * actually reports to whom. Ported verbatim from monomind's renderChart()
 * (packages/@monomind/cli/src/ui/orgs.html).
 */
export function buildChartEdges(roles: LayoutRole[], communication: CommEdge[]): CommEdge[] {
  const reportEdges: CommEdge[] = roles
    .filter((r) => r.reports_to && r.reports_to !== r.id)
    .map((r) => ({ from: r.reports_to as string, to: r.id, type: "report" as const }));
  return reportEdges.concat(communication);
}

/** True when both A→B and B→A exist among the given edges. */
export function hasAntiParallelPair(edges: CommEdge[], from: string, to: string): boolean {
  return edges.some((e) => e.from === to && e.to === from);
}
