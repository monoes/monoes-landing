import Image from "next/image";
import styles from "./hub.module.css";

export type ConstellationNode = { kind: "org" | "workflow" | "automation"; name: string };

const W = 720;
const H = 540;
const CX = 360;
const CY = 270;
const RX = 268;
const RY = 205;
// Where the six newest items sit around the mascot (angle in degrees).
const ANGLES = [-150, -90, -30, 30, 90, 150];

const STROKE = { org: "#C8A97E", workflow: "#B8956A", automation: "#EDE5D8" } as const;

// Deterministic "stars" so server and client agree.
const STARS = Array.from({ length: 34 }, (_, i) => {
  const a = (i * 137.508 * Math.PI) / 180;
  const r = 60 + ((i * 53) % 190);
  return { x: CX + Math.cos(a) * r * 1.5, y: CY + Math.sin(a) * r * 1.1, o: 0.12 + ((i * 7) % 10) / 40 };
});

function shorten(name: string): string {
  return name.length > 24 ? `${name.slice(0, 23)}…` : name;
}

function Shape({ kind }: { kind: ConstellationNode["kind"] }) {
  const common = { fill: "#1a1208", stroke: STROKE[kind], strokeWidth: 1.6 };
  if (kind === "org") return <polygon points="0,-13 11.3,-6.5 11.3,6.5 0,13 -11.3,6.5 -11.3,-6.5" {...common} />;
  if (kind === "workflow")
    return (
      <>
        <circle r="11" {...common} />
        <circle r="3.5" fill={STROKE.workflow} />
      </>
    );
  return <rect x="-10" y="-10" width="20" height="20" rx="4" {...common} />;
}

/**
 * The hub's hero graphic: the newest orgs, workflows and web automations as
 * a constellation wired to the Monoes mascot, with signals travelling in.
 */
export function Constellation({ nodes }: { nodes: ConstellationNode[] }) {
  const placed = nodes.slice(0, ANGLES.length).map((n, i) => {
    const a = (ANGLES[i] * Math.PI) / 180;
    const x = CX + Math.cos(a) * RX;
    const y = CY + Math.sin(a) * RY;
    // Curve each edge a little, alternately, so the web doesn't look ruled.
    const bend = i % 2 === 0 ? 38 : -38;
    const mx = (x + CX) / 2 + Math.sin(a) * bend;
    const my = (y + CY) / 2 - Math.cos(a) * bend;
    // Labels go above nodes in the top half and below in the bottom half, centred, so they stay inside the frame.
    return { ...n, x, y, d: `M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${CX},${CY}`, above: y < CY };
  });

  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-labelledby="constellation-title">
        <title id="constellation-title">
          {placed.length
            ? `Newest in the community: ${placed.map((p) => p.name).join(", ")}`
            : "Orgs, workflows and web automations, connected"}
        </title>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r="1.2" fill="#C8A97E" opacity={s.o} />
        ))}
        {[0, 1200, 2400].map((d) => (
          <circle
            key={d}
            className={styles.ring}
            style={{ "--d": `${d}ms` } as React.CSSProperties}
            cx={CX}
            cy={CY}
            r="135"
            fill="none"
            stroke="#C8A97E"
            strokeOpacity="0.35"
          />
        ))}
        {placed.map((p, i) => (
          <path
            key={`e${i}`}
            id={`constellation-edge-${i}`}
            className={styles.edge}
            style={{ "--d": `${300 + i * 120}ms` } as React.CSSProperties}
            d={p.d}
            pathLength={1}
            strokeDasharray="1"
            fill="none"
            stroke={STROKE[p.kind]}
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />
        ))}
        <g className={styles.pulses}>
          {placed.map((p, i) => (
            <circle key={`p${i}`} r="2.6" fill="#FFFFF0">
              <animateMotion dur={`${3.2 + (i % 3) * 0.7}s`} begin={`${1.6 + i * 0.45}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1">
                <mpath href={`#constellation-edge-${i}`} />
              </animateMotion>
            </circle>
          ))}
        </g>
        {placed.map((p, i) => (
          <g key={`n${i}`} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
            <g className={styles.float} style={{ "--f": `${i * 900}ms` } as React.CSSProperties}>
              <g className={styles.node} style={{ "--d": `${900 + i * 120}ms` } as React.CSSProperties}>
                <Shape kind={p.kind} />
              </g>
              <text
                className={styles.label}
                style={{ "--d": `${1200 + i * 120}ms` } as React.CSSProperties}
                x="0"
                y={p.above ? -24 : 34}
                textAnchor="middle"
                fill="#FFFFF0"
                fillOpacity="0.85"
                fontSize="15"
              >
                {shorten(p.name)}
              </text>
            </g>
          </g>
        ))}
      </svg>
      <Image
        src="/images/community/mascot-jump.webp"
        alt=""
        width={560}
        height={560}
        priority
        className={`${styles.mascot} pointer-events-none absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]`}
      />
    </div>
  );
}
