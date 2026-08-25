// Ported from monomind/packages/@monomind/cli/src/ui/orgs.html's
// computeLayout() function — the same positioning algorithm monomind's
// own dashboard uses to lay out an org chart, translated from vanilla
// JS/DOM manipulation into a pure TypeScript function. The math (angles,
// depth-layering, row splitting) is unchanged from the source.
//
// Position-only, matching monomind's own separation of concerns: edge
// construction (reports_to + communication) lives in OrgChart.tsx's
// buildChartEdges(), not here.

export type LayoutRole = {
  id: string;
  reports_to: string | null;
};

export type LayoutNode = {
  id: string;
  x: number;
  y: number;
};

export type OrgPositions = {
  nodes: LayoutNode[];
  viewBoxHeight: number;
};

export function computeLayout(
  roles: LayoutRole[],
  topology: string | null | undefined,
  width: number,
  height: number,
): OrgPositions {
  const n = roles.length;
  if (n === 0) {
    return { nodes: [], viewBoxHeight: height };
  }

  const cx = width / 2;
  const cy = height / 2;
  const PAD = 60;
  const MAX_PER_ROW = Math.max(2, Math.min(4, Math.ceil(Math.sqrt(n))));

  const nodes: LayoutNode[] = [];
  let viewBoxHeight = height;

  if (topology === "mesh") {
    const r = Math.min((width - PAD * 2) / 2, (height - PAD * 2) / 2) * 0.8;
    roles.forEach((role, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      nodes.push({ id: role.id, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    });
  } else if (topology === "star") {
    const boss = roles.find((r) => !r.reports_to) ?? roles[0];
    const rest = roles.filter((r) => r.id !== boss.id);
    nodes.push({ id: boss.id, x: cx, y: cy });
    const r2 = Math.min((width - PAD * 2) / 2, (height - PAD * 2) / 2) * 0.75;
    rest.forEach((role, i) => {
      const angle = (2 * Math.PI * i) / rest.length - Math.PI / 2;
      nodes.push({ id: role.id, x: cx + r2 * Math.cos(angle), y: cy + r2 * Math.sin(angle) });
    });
  } else {
    // Hierarchical (default): layer by reports_to depth.
    const depthMap: Record<string, number> = Object.create(null);
    roles.forEach((r) => {
      if (!r.reports_to || r.reports_to === r.id) depthMap[r.id] = 0;
    });
    let changed = true;
    let iter = 0;
    while (changed && iter < 20) {
      changed = false;
      iter++;
      roles.forEach((r) => {
        if (r.reports_to && r.reports_to !== r.id && depthMap[r.reports_to] !== undefined) {
          const newDepth = (depthMap[r.reports_to] ?? 0) + 1;
          if (depthMap[r.id] !== newDepth) {
            depthMap[r.id] = newDepth;
            changed = true;
          }
        }
      });
    }
    roles.forEach((r) => {
      if (depthMap[r.id] === undefined) depthMap[r.id] = 1;
    });

    const layerMap: Record<number, string[]> = {};
    Object.entries(depthMap).forEach(([id, depth]) => {
      if (!layerMap[depth]) layerMap[depth] = [];
      layerMap[depth].push(id);
    });

    const visualRows: string[][] = [];
    const sortedDepths = Object.keys(layerMap)
      .map(Number)
      .sort((a, b) => a - b);
    sortedDepths.forEach((depth) => {
      const ids = layerMap[depth];
      for (let i = 0; i < ids.length; i += MAX_PER_ROW) {
        visualRows.push(ids.slice(i, i + MAX_PER_ROW));
      }
    });

    const totalRows = visualRows.length;
    const ROW_H = 100;
    const totalH = Math.max(height, PAD * 2 + totalRows * ROW_H);

    const positionsById: Record<string, { x: number; y: number }> = Object.create(null);
    visualRows.forEach((ids, rowIdx) => {
      const y = PAD + rowIdx * ROW_H + ROW_H / 2;
      const colW = (width - PAD * 2) / (ids.length + 1);
      ids.forEach((id, i) => {
        positionsById[id] = { x: PAD + colW * (i + 1), y };
      });
    });
    roles.forEach((r) => {
      const pos = positionsById[r.id];
      if (pos) nodes.push({ id: r.id, x: pos.x, y: pos.y });
    });

    if (totalH > height) viewBoxHeight = totalH;
  }

  return { nodes, viewBoxHeight };
}
