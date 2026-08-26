import type { LayoutRole } from "./org-layout";

export type CommEdge = { from: string; to: string; type: "command" | "report" | "feedback" | "handoff" };

function isLeaderRole(r: LayoutRole): boolean {
  return !r.reports_to || r.reports_to === r.id;
}

/**
 * Ported from monomind's dashboard.html V2 org chart (renderChart's
 * "auto-generate edges" step): when the org declares explicit communication
 * edges, those are drawn as-is — reports_to lines are NOT also added. Only
 * when communication is empty does it fall back to auto-generated
 * command+report pairs between each role and its manager (or the leader,
 * if reports_to points nowhere real).
 */
export function buildChartEdges(roles: LayoutRole[], communication: CommEdge[] | undefined): CommEdge[] {
  const explicit = Array.isArray(communication) ? communication : [];
  if (explicit.length > 0 || roles.length <= 1) return explicit;

  const roleIds = new Set(roles.map((r) => r.id));
  const leader = roles.find(isLeaderRole) || roles[0];
  return roles
    .filter((r) => r.id !== leader.id)
    .flatMap((r) => {
      const parentId = r.reports_to && r.reports_to !== r.id && roleIds.has(r.reports_to) ? r.reports_to : leader.id;
      return [
        { from: parentId, to: r.id, type: "command" as const },
        { from: r.id, to: parentId, type: "report" as const },
      ];
    });
}
