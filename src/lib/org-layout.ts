// Ported from monomind's dashboard.html V2 org chart (v2RenderOrgChart's
// layout section) — the same positioning algorithm monomind's own dashboard
// uses: hub-and-spoke by default, a circular ring for mesh, a line for
// ring/pipeline, a BFS-by-depth layered layout when the org declares
// explicit communication edges, and a serpentine grid re-flow for crowded
// (5+ role) orgs so a wide row doesn't overflow the chart. The "expanded
// full-page modal" sizing branch from the source has no equivalent here —
// monoes.me's org chart is always the compact/inline size.

export type LayoutRole = {
  id: string;
  reports_to: string | null;
};

export type EdgeLike = { from: string; to: string; type?: string };

export type LayoutResult = {
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
  nodeRadius: number;
};

function isLeader(r: LayoutRole): boolean {
  return !r.reports_to || r.reports_to === r.id;
}

export function computeLayout(
  roles: LayoutRole[],
  explicitCommunication: EdgeLike[] | undefined,
  topology: string | null | undefined,
): LayoutResult {
  const topo = (topology || "hierarchical").toLowerCase();
  let W = 720;
  const crowded = roles.length > 4;
  const R = crowded ? 34 : 42;
  const PAD_X = crowded ? Math.max(R + 20, 78) : R + 20;
  const PAD_Y = crowded ? R + 96 : R + 24;
  const LBL_BELOW = R + 29 + 8;
  const roleIds = new Set(roles.map((r) => r.id));
  const leaders = roles.filter(isLeader);
  const lr = leaders[0] || roles[0];
  const hasSubs = !!lr && roles.length > 1;

  const positions: Record<string, { x: number; y: number }> = Object.create(null);
  let layoutH: number | null = null;

  const hubAndSpoke = () => {
    if (leaders.length > 0) {
      leaders.forEach((r, i) => {
        const x = leaders.length === 1 ? W / 2 : PAD_X + ((W - PAD_X * 2) / (leaders.length - 1)) * i;
        positions[r.id] = { x, y: PAD_Y };
      });
    }
    const subs = roles.filter((r) => !isLeader(r));
    const usableW = W - PAD_X * 2;
    const subY = leaders.length > 0 ? PAD_Y + 220 : PAD_Y;
    subs.forEach((r, i) => {
      const x = subs.length === 1 ? W / 2 : PAD_X + (usableW / (subs.length - 1)) * i;
      positions[r.id] = { x, y: subY };
    });
    const hasBothRows = leaders.length > 0 && subs.length > 0;
    layoutH = hasBothRows ? PAD_Y + 220 + LBL_BELOW : PAD_Y + LBL_BELOW;
  };

  if (roles.length === 0) {
    // nothing to lay out
  } else if (!hasSubs) {
    positions[roles[0].id] = { x: W / 2, y: 90 };
    layoutH = 180;
  } else if (topo === "mesh") {
    const n = roles.length;
    const cx = W / 2;
    const minRad = ((2 * R + 6) * n) / (2 * Math.PI);
    const rad = Math.max(minRad, Math.min((W - PAD_X * 2) / 2, 130) * 0.82);
    const cy = Math.max(170, rad + PAD_Y);
    roles.forEach((r, i) => {
      const a = (2 * Math.PI * i) / n - Math.PI / 2;
      positions[r.id] = { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
    });
    layoutH = Math.round(cy + rad + LBL_BELOW);
  } else if (topo === "ring" || topo === "pipeline") {
    const usableW = W - PAD_X * 2;
    roles.forEach((r, i) => {
      const x = roles.length === 1 ? W / 2 : PAD_X + (usableW / (roles.length - 1)) * i;
      positions[r.id] = { x, y: 90 };
    });
    layoutH = 180;
  } else if (Array.isArray(explicitCommunication) && explicitCommunication.length > 0) {
    // BFS multi-level layout — only traverse forward (non-report) edges.
    const fwdEdges = explicitCommunication.filter((e) => e.type !== "report");
    if (!fwdEdges.length) {
      hubAndSpoke();
    } else {
      const depth: Record<string, number> = Object.create(null);
      leaders.forEach((r) => {
        depth[r.id] = 0;
      });
      const queue: string[] = leaders.map((r) => r.id);
      while (queue.length) {
        const cur = queue.shift() as string;
        fwdEdges.forEach((e) => {
          if (e.from === cur && roleIds.has(e.to) && depth[e.to] === undefined) {
            depth[e.to] = depth[cur] + 1;
            queue.push(e.to);
          }
        });
      }
      roles.forEach((r) => {
        if (depth[r.id] === undefined) depth[r.id] = 1;
      });
      const minDepth = Math.min(...roles.map((r) => depth[r.id]));
      if (minDepth > 0) roles.forEach((r) => (depth[r.id] -= minDepth));
      const maxDepth = Math.max(...roles.map((r) => depth[r.id]));
      const layerOf: Record<number, LayoutRole[]> = {};
      for (let d = 0; d <= maxDepth; d++) layerOf[d] = [];
      roles.forEach((r) => layerOf[depth[r.id]].push(r));

      const LAYER_H = 110;
      layoutH = PAD_Y + maxDepth * LAYER_H + LBL_BELOW;

      for (let d = 0; d <= maxDepth; d++) {
        const layer = layerOf[d];
        const usableW = W - PAD_X * 2;
        layer.forEach((r, i) => {
          const x = layer.length === 1 ? W / 2 : PAD_X + (usableW / (layer.length - 1)) * i;
          positions[r.id] = { x, y: PAD_Y + d * LAYER_H };
        });
      }
    }
  } else {
    hubAndSpoke();
  }

  // Crowded re-flow: break a wall of <=2 rows into a serpentine grid so
  // topology reads instead of a wide overlapping row.
  if (crowded) {
    const rowsSeen = new Set(Object.values(positions).map((p) => Math.round(p.y)));
    const rowCounts = [...rowsSeen].map((y) => Object.values(positions).filter((p) => Math.round(p.y) === y).length);
    const widest = rowCounts.length ? Math.max(...rowCounts) : 0;
    if (rowsSeen.size <= 2 && widest > 4) {
      const seq = [...roles].sort((a, b) => positions[a.id].y - positions[b.id].y || positions[a.id].x - positions[b.id].x);
      const perRow = Math.min(6, Math.ceil(seq.length / Math.ceil(seq.length / 6)));
      const COL_W = 185;
      const ROW_H = 205;
      seq.forEach((r, i) => {
        const row = Math.floor(i / perRow);
        let col = i % perRow;
        if (row % 2 === 1) col = perRow - 1 - col;
        positions[r.id] = { x: PAD_X + col * COL_W, y: PAD_Y + row * ROW_H };
      });
      const rows = Math.ceil(seq.length / perRow);
      W = PAD_X * 2 + (perRow - 1) * COL_W;
      layoutH = PAD_Y + (rows - 1) * ROW_H + LBL_BELOW;
    }
  }

  const H = layoutH ?? (hasSubs ? 320 : 180);
  return { positions, width: W, height: H, nodeRadius: R };
}
