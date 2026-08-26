"use client";

import { useEffect, useState } from "react";
import { computeLayout, type LayoutRole } from "@/lib/org-layout";
import { buildChartEdges, type CommEdge } from "@/lib/org-chart-edges";
import { avatarMapFor, roleAvatar } from "@/lib/org-avatars";

export type { CommEdge };

// Direct port of monomind's dashboard.html V2 org chart (v2RenderOrgChart):
// same dark chart background, glow filter, avatar-in-circle nodes, curved/
// offset edges with arrowheads, and an animated flow particle on command
// edges. Feedback keeps its own distinct color (this schema supports 4
// edge types where monomind's only has 3); everything else is unchanged.
const EDGE_STYLE: Record<CommEdge["type"], { color: string; opacity: number; width: number; dash: string; markerId: string; label: string }> = {
  command: { color: "oklch(72% 0.18 75)", opacity: 0.7, width: 1.8, dash: "", markerId: "arr-command", label: "Command" },
  report: { color: "oklch(65% 0.12 240)", opacity: 0.55, width: 1.2, dash: "5 4", markerId: "arr-report", label: "Report" },
  feedback: { color: "oklch(78% 0.18 80)", opacity: 0.45, width: 1, dash: "2 4", markerId: "arr-feedback", label: "Feedback" },
  handoff: { color: "oklch(65% 0.15 150)", opacity: 0.6, width: 1.5, dash: "", markerId: "arr-handoff", label: "Handoff" },
};

const EDGE_TYPE_ORDER: CommEdge["type"][] = ["command", "report", "feedback", "handoff"];

type ChartRole = LayoutRole & { title?: string; agent_type?: string; avatar?: string };

function isLeaderRole(r: ChartRole): boolean {
  return !r.reports_to || r.reports_to === r.id;
}

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
  const edges = buildChartEdges(roles, communication);
  const { positions, width: W, height: H, nodeRadius: R } = computeLayout(roles, edges, topology);
  const avatarMap = avatarMapFor(roles);
  const presentTypes = EDGE_TYPE_ORDER.filter((t) => edges.some((e) => e.type === t));

  // The flow-particle <animateMotion> is native SMIL — it starts running the
  // instant the browser parses it, mutating the particle circle's position
  // before React finishes hydrating. That desync between the server-rendered
  // snapshot and the now-animated DOM trips a hydration mismatch. Mounting
  // particles only after hydration completes avoids the browser ever seeing
  // them in the pre-hydration markup.
  const [particlesMounted, setParticlesMounted] = useState(false);
  useEffect(() => setParticlesMounted(true), []);

  if (roles.length === 0) {
    return (
      <svg viewBox="0 0 720 320" className="w-full rounded-lg border border-ivory-linen bg-[oklch(12%_0.008_55)]">
        <text x={360} y={160} textAnchor="middle" className="fill-ivory/40 text-[11px] font-medium tracking-wide">
          NO ROLES DEFINED
        </text>
      </svg>
    );
  }

  return (
    <div>
      <svg id="org-chart-svg" viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg border border-ivory-linen bg-[oklch(12%_0.008_55)]">
        <defs>
          {EDGE_TYPE_ORDER.map((type) => (
            <marker key={type} id={EDGE_STYLE[type].markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0.5 L0,6.5 L6,3.5 z" fill={EDGE_STYLE[type].color} opacity={EDGE_STYLE[type].opacity} />
            </marker>
          ))}
          <filter id="org-chart-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {roles.map((role, i) => (
            <clipPath key={role.id} id={`org-chart-clip-${i}`}>
              <circle r={Math.round(R * 0.88)} />
            </clipPath>
          ))}
          <style>{`
            .org-chart-node { transform-box: fill-box; transform-origin: center; }
            @media (prefers-reduced-motion: no-preference) {
              .org-chart-node { animation: org-chart-node-in 0.45s cubic-bezier(0.16,1,0.3,1) backwards; }
            }
            @keyframes org-chart-node-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </defs>
        {edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to || edge.from === edge.to) return null;
          const style = EDGE_STYLE[edge.type];

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.hypot(dx, dy) || 1;
          // Perpendicular offset by edge type (not just anti-parallel pairs) —
          // ported verbatim from monomind so parallel command/report lines
          // between the same two nodes never overlap.
          const canonDir = String(edge.from) < String(edge.to) ? 1 : -1;
          const px = (-dy / len) * canonDir;
          const py = (dx / len) * canonDir;
          const edgeSide = edge.type === "report" ? -1 : 1;
          const OFFSET = 8;
          const ox = px * OFFSET * edgeSide;
          const oy = py * OFFSET * edgeSide;

          const trimS = R + 3;
          const trimE = R + 8;
          const x1 = (from.x + ox + (dx / len) * trimS).toFixed(1);
          const y1 = (from.y + oy + (dy / len) * trimS).toFixed(1);
          const x2 = (to.x + ox - (dx / len) * trimE).toFixed(1);
          const y2 = (to.y + oy - (dy / len) * trimE).toFixed(1);

          const spanLen = len - (trimS + trimE);
          const pid = `org-chart-edge-${i}`;
          let d: string;
          if (spanLen > 260) {
            const sag = Math.min(56, spanLen * 0.14) * edgeSide * canonDir;
            const mx = ((+x1 + +x2) / 2 + px * sag).toFixed(1);
            const my = ((+y1 + +y2) / 2 + py * sag).toFixed(1);
            d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
          } else {
            d = `M${x1},${y1} L${x2},${y2}`;
          }

          return (
            <g key={i}>
              <path
                id={pid}
                className="org-chart-edge"
                d={d}
                fill="none"
                stroke={style.color}
                strokeOpacity={style.opacity}
                strokeWidth={style.width}
                strokeDasharray={style.dash || undefined}
                markerEnd={`url(#${style.markerId})`}
              />
              {edge.type === "command" && particlesMounted && (
                <circle r="3.5" fill={style.color} opacity={0.7}>
                  <animateMotion dur="2s" repeatCount="indefinite" begin={`${(i * 0.4).toFixed(2)}s`}>
                    {/* eslint-disable-next-line react/no-unknown-property -- xlinkHref keeps older SVG UAs working alongside the modern href attribute */}
                    <mpath href={`#${pid}`} xlinkHref={`#${pid}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          );
        })}
        {roles.map((role, i) => {
          const pos = positions[role.id];
          if (!pos) return null;
          const leader = isLeaderRole(role);
          const displayName = role.title || role.id;
          const subType = role.agent_type || "";
          const maxLbl = Math.max(12, Math.floor(R / 3));
          const nameText = displayName.length > maxLbl ? `${displayName.slice(0, maxLbl - 1)}…` : displayName;
          const subTypeText = subType.length > maxLbl ? `${subType.slice(0, maxLbl - 1)}…` : subType;
          const nameY = R + 14;
          const avR = Math.round(R * 0.88);
          const avatarSrc = roleAvatar(role, avatarMap);
          const lblW = Math.max(nameText.length, subTypeText.length) * 6.5 + 12;
          const lblH = subTypeText ? 26 : 15;

          return (
            <g
              key={role.id}
              className="org-chart-node cursor-pointer"
              style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
              transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)})`}
              onClick={() => onSelectRole(role.id)}
            >
              <title>
                {displayName}
                {subType ? ` · ${subType}` : ""} — click for details
              </title>
              <circle r={R} fill="oklch(12% 0.008 55)" stroke={leader ? "oklch(72% 0.18 75)" : "oklch(65% 0.12 240)"} strokeWidth={leader ? 2.5 : 1.8} filter="url(#org-chart-node-glow)" />
              {/* Decorative leader ring, drawn after the interactive node
                  circle so it never shadows `circle` locators — hollow
                  (fill="none") shapes have no reliable hit-testable center. */}
              {leader && <circle r={R + 9} fill="none" stroke="oklch(72% 0.18 75)" strokeWidth={0.6} opacity={0.18} className="pointer-events-none" />}
              <image
                href={avatarSrc}
                x={-avR}
                y={-avR}
                width={avR * 2}
                height={avR * 2}
                clipPath={`url(#org-chart-clip-${i})`}
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none"
              />
              <rect x={(-lblW / 2).toFixed(0)} y={nameY - 11} width={lblW.toFixed(0)} height={lblH} rx={3} fill="oklch(12% 0.008 55 / 0.85)" className="pointer-events-none" />
              <text textAnchor="middle" y={nameY} fontSize={9} fontWeight={leader ? 600 : 500} className="pointer-events-none fill-[oklch(85%_0.01_75)] font-sans">
                {nameText}
              </text>
              {subTypeText && (
                <text textAnchor="middle" y={nameY + 11} fontSize={7.5} className="pointer-events-none fill-[oklch(58%_0.005_75)] font-sans">
                  {subTypeText}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {presentTypes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-espresso/55">
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
