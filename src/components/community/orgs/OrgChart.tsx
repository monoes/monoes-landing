"use client";

import { computeLayout, type LayoutRole } from "@/lib/org-layout";
import { buildChartEdges, hasAntiParallelPair, type CommEdge } from "@/lib/org-chart-edges";

export type { CommEdge };

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

// Direct port of monomind's strokeMap/markerMap (packages/@monomind/cli/src/ui/orgs.html).
const EDGE_STYLE: Record<CommEdge["type"], { color: string; opacity: number; width: number; dash: string; markerId: string; label: string }> = {
  command: { color: "oklch(62% 0.20 186)", opacity: 0.5, width: 1.5, dash: "", markerId: "arr-command", label: "Command" },
  report: { color: "oklch(68% 0.18 252)", opacity: 0.4, width: 1, dash: "4 3", markerId: "arr-report", label: "Report" },
  feedback: { color: "oklch(78% 0.18 80)", opacity: 0.3, width: 1, dash: "2 4", markerId: "arr-feedback", label: "Feedback" },
  handoff: { color: "oklch(68% 0.20 150)", opacity: 0.45, width: 1.5, dash: "", markerId: "arr-handoff", label: "Handoff" },
};

const EDGE_TYPE_ORDER: CommEdge["type"][] = ["command", "report", "feedback", "handoff"];

const WIDTH = 720;
const HEIGHT = 320;
const NODE_RADIUS = 22;
const BOSS_RADIUS = 26;

type ChartRole = LayoutRole & { title?: string; agent_type?: string };

export function OrgChart({
  roles,
  topology,
  communication,
  onSelectRole,
}: {
  roles: ChartRole[];
  topology: string | null | undefined;
  communication: CommEdge[];
  onSelectRole: (roleId: string) => void;
}) {
  const layout = computeLayout(roles, topology, WIDTH, HEIGHT);
  const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));
  const edges = buildChartEdges(roles, communication);
  const presentTypes = EDGE_TYPE_ORDER.filter((t) => edges.some((e) => e.type === t));

  if (roles.length === 0) {
    return (
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full rounded-lg border border-ivory-linen bg-ivory">
        <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" className="fill-espresso/40 text-[11px] font-medium tracking-wide">
          NO ROLES DEFINED
        </text>
      </svg>
    );
  }

  return (
    <div>
      <svg id="org-chart-svg" viewBox={`0 0 ${WIDTH} ${layout.viewBoxHeight}`} className="w-full rounded-lg border border-ivory-linen bg-ivory">
        <defs>
          {/* Exact port of monomind's orgs.html arrow markers (path/refX/refY/size) and node-glow filter. */}
          {EDGE_TYPE_ORDER.map((type) => (
            <marker key={type} id={EDGE_STYLE[type].markerId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={EDGE_STYLE[type].color} opacity={EDGE_STYLE[type].opacity} />
            </marker>
          ))}
          <filter id="org-chart-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .org-chart-node-pulse {
                transform-box: fill-box;
                transform-origin: center;
                animation: org-chart-pulse 2.5s ease-in-out infinite;
              }
            }
            @keyframes org-chart-pulse {
              0%, 100% { transform: scale(1); opacity: 0.18; }
              50% { transform: scale(1.18); opacity: 0.45; }
            }
          `}</style>
        </defs>
        {edges.map((edge, i) => {
          const from = nodeById.get(edge.from);
          const to = nodeById.get(edge.to);
          if (!from || !to || edge.from === edge.to) return null;
          const style = EDGE_STYLE[edge.type];

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.hypot(dx, dy) || 1;
          const R = 24;

          let px = 0;
          let py = 0;
          if (hasAntiParallelPair(edges, edge.from, edge.to)) {
            const [canonFrom, canonTo] = edge.from < edge.to ? [edge.from, edge.to] : [edge.to, edge.from];
            const cp = nodeById.get(canonFrom);
            const ct = nodeById.get(canonTo);
            if (cp && ct) {
              const cdx = ct.x - cp.x;
              const cdy = ct.y - cp.y;
              const clen = Math.hypot(cdx, cdy) || 1;
              const sign = edge.from === canonFrom ? 1 : -1;
              px = sign * (-cdy / clen) * 6;
              py = sign * (cdx / clen) * 6;
            }
          }

          const x1 = from.x + (dx / len) * R + px;
          const y1 = from.y + (dy / len) * R + py;
          const x2 = to.x - (dx / len) * (R + 4) + px;
          const y2 = to.y - (dy / len) * (R + 4) + py;

          return (
            <line
              key={i}
              x1={x1.toFixed(1)}
              y1={y1.toFixed(1)}
              x2={x2.toFixed(1)}
              y2={y2.toFixed(1)}
              stroke={style.color}
              strokeOpacity={style.opacity}
              strokeWidth={style.width}
              strokeDasharray={style.dash || undefined}
              markerEnd={`url(#${style.markerId})`}
            />
          );
        })}
        {roles.map((role, i) => {
          const pos = nodeById.get(role.id);
          if (!pos) return null;
          const isBoss = !role.reports_to;
          const color = roleColor(i);
          const title = role.title || role.id;
          const shortTitle = title.length > 10 ? `${title.slice(0, 9)}…` : title;
          const agentType = role.agent_type;
          const shortAgentType = agentType && agentType.length > 12 ? `${agentType.slice(0, 11)}…` : agentType;

          return (
            <g key={role.id} onClick={() => onSelectRole(role.id)} className="cursor-pointer">
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isBoss ? BOSS_RADIUS : NODE_RADIUS}
                fill="var(--color-espresso, #4b3621)"
                stroke={color}
                strokeWidth={2}
                filter="url(#org-chart-node-glow)"
              />
              {/* Drawn after (on top of) the node so it never shadows the
                  interactive circle for `circle` locators/selectors — a
                  stroke-only, pointer-events-none ring naturally surrounds
                  the node without covering or intercepting it. */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={(isBoss ? BOSS_RADIUS : NODE_RADIUS) + 4}
                fill="none"
                stroke={color}
                strokeWidth={1}
                className="org-chart-node-pulse pointer-events-none"
              />
              <text
                x={pos.x}
                y={pos.y - (agentType ? 2 : -3)}
                textAnchor="middle"
                fill={color}
                className="pointer-events-none font-mono text-[9px] font-medium"
              >
                {shortTitle}
              </text>
              {shortAgentType && (
                <text x={pos.x} y={pos.y + 10} textAnchor="middle" className="pointer-events-none fill-ivory/60 font-mono text-[7px]">
                  {shortAgentType}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {presentTypes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-wide text-espresso/55">
          {presentTypes.map((type) => (
            <span key={type} className="flex items-center gap-1.5">
              <svg width="24" height="8">
                <line
                  x1="0"
                  y1="4"
                  x2="24"
                  y2="4"
                  stroke={EDGE_STYLE[type].color}
                  strokeOpacity={EDGE_STYLE[type].opacity}
                  strokeWidth={EDGE_STYLE[type].width}
                  strokeDasharray={EDGE_STYLE[type].dash || undefined}
                />
              </svg>
              {EDGE_STYLE[type].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
