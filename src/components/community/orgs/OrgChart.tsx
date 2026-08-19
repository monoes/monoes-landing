"use client";

import { computeLayout, type LayoutRole } from "@/lib/org-layout";

const ROLE_COLORS = [
  "oklch(62% 0.20 186)",
  "oklch(68% 0.18 252)",
  "oklch(68% 0.20 150)",
  "oklch(78% 0.18 80)",
  "oklch(62% 0.22 25)",
  "oklch(74% 0.16 310)",
];

function roleColor(i: number): string {
  return ROLE_COLORS[i % ROLE_COLORS.length];
}

const WIDTH = 720;
const HEIGHT = 320;

export function OrgChart({
  roles,
  topology,
  onSelectRole,
}: {
  roles: LayoutRole[];
  topology: string | null | undefined;
  onSelectRole: (roleId: string) => void;
}) {
  const layout = computeLayout(roles, topology, WIDTH, HEIGHT);
  const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${layout.viewBoxHeight}`} className="w-full rounded-lg border border-ivory-linen bg-ivory">
      <defs>
        <marker id="org-chart-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-espresso, #4b3621)" opacity="0.4" />
        </marker>
      </defs>
      {layout.edges.map((edge, i) => {
        const from = nodeById.get(edge.from);
        const to = nodeById.get(edge.to);
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--color-espresso, #4b3621)"
            strokeOpacity={0.3}
            strokeWidth={1.5}
            markerEnd="url(#org-chart-arrow)"
          />
        );
      })}
      {roles.map((role, i) => {
        const pos = nodeById.get(role.id);
        if (!pos) return null;
        return (
          <g key={role.id} onClick={() => onSelectRole(role.id)} className="cursor-pointer">
            <circle cx={pos.x} cy={pos.y} r={22} fill={roleColor(i)} />
            <text x={pos.x} y={pos.y + 36} textAnchor="middle" className="fill-espresso text-[10px] font-medium">
              {role.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
