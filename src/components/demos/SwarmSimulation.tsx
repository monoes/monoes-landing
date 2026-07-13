"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type Status  = "idle" | "running" | "done";
type TopoKey = "hierarchical" | "mesh" | "hierarchical-mesh" | "ring" | "star" | "hybrid" | "adaptive";

const GOLD      = "#C8A97E";
const GOLD_F    = "rgba(200,169,126,0.16)";
const GOLD_M    = "rgba(200,169,126,0.60)";
const GREEN_F   = "rgba(100,200,120,0.22)";
const GREEN_R   = "rgba(100,200,120,0.70)";
const ESPRESSO  = "#2A2318";
const IVORY     = "#FAF7F0";

const CW = 320, CH = 218;
const CX = CW / 2, CY = CH / 2;

const BOSS_R = 11;
const NODE_R = 7;
const ACTIVE_FRAMES = 48; // ~800ms at 60fps
const WAVE_MS = 580;

interface Pt { x: number; y: number }

interface TopoDef {
  label: string;
  badge: string;
  note: string;
  goodFor: string;
  nodes: Pt[];
  bossIdx?: number;
  edges: [number, number][];
  peerEdges?: [number, number][];
  waves: number[][];
}

function ring(n: number, cx: number, cy: number, r: number): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: Math.round(cx + r * Math.cos(a)), y: Math.round(cy + r * Math.sin(a)) };
  });
}

function dedup(edges: [number, number][]): [number, number][] {
  const seen = new Set<string>();
  return edges.filter(([a, b]) => {
    const k = `${Math.min(a,b)}-${Math.max(a,b)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const TOPOS: Record<TopoKey, TopoDef> = {
  hierarchical: {
    label: "Hierarchical",
    badge: "raft consensus",
    note: "Leader-led. Boss coordinates sub-leads who coordinate workers. Anti-drift default for all Mastermind swarms.",
    goodFor: "Complex projects needing clear ownership, accountability, and drift-free coordination.",
    bossIdx: 0,
    nodes: [
      { x: 160, y: 24 },
      { x: 62, y: 102 }, { x: 160, y: 102 }, { x: 258, y: 102 },
      { x: 18, y: 190 }, { x: 78, y: 190 },
      { x: 160, y: 190 },
      { x: 242, y: 190 }, { x: 302, y: 190 },
    ],
    edges: [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[3,7],[3,8]],
    waves: [[0],[1,2,3],[4,5,6,7,8]],
  },

  mesh: {
    label: "Mesh",
    badge: "p2p",
    note: "Peer-to-peer — no single leader. Any node reaches any other in at most 2 hops. Resilient to individual failure.",
    goodFor: "Research and discovery tasks where any agent may surface relevant context.",
    nodes: ring(8, CX, CY, 82),
    edges: dedup(
      Array.from({ length: 8 }, (_, i) =>
        [1,2,3].map(d => [i, (i+d)%8] as [number,number])
      ).flat()
    ),
    waves: [[0],[1,7],[2,6],[3,5],[4]],
  },

  "hierarchical-mesh": {
    label: "Hierarchical-Mesh",
    badge: "--v1-mode default",
    note: "Hybrid: hierarchical spine for coordination + peer connections within teams. Default for 15-agent swarm runs.",
    goodFor: "Large autonomous runs balancing top-down coordination with team-level parallelism.",
    bossIdx: 0,
    nodes: [
      { x: 160, y: 18 },
      { x: 55, y: 90 }, { x: 160, y: 90 }, { x: 265, y: 90 },
      { x: 16, y: 170 }, { x: 56, y: 170 }, { x: 96, y: 170 },
      { x: 148, y: 170 }, { x: 172, y: 170 },
      { x: 224, y: 170 }, { x: 264, y: 170 }, { x: 304, y: 170 },
    ],
    edges: [[0,1],[0,2],[0,3],[1,4],[1,5],[1,6],[2,7],[2,8],[3,9],[3,10],[3,11]],
    peerEdges: [[1,2],[2,3],[4,5],[5,6],[9,10],[10,11]],
    waves: [[0],[1,2,3],[4,5,6,7,8,9,10,11]],
  },

  ring: {
    label: "Ring",
    badge: "sequential",
    note: "Token passes node-to-node around the ring. Predictable delivery order; any single break can be rerouted.",
    goodFor: "Ordered pipelines where each stage depends on the previous — reviews, approvals, sequential transforms.",
    nodes: ring(8, CX, CY, 82),
    edges: Array.from({ length: 8 }, (_, i) => [i, (i+1)%8] as [number,number]),
    waves: [[0],[1],[2],[3],[4],[5],[6],[7]],
  },

  star: {
    label: "Star",
    badge: "hub-spoke",
    note: "Hub broadcasts to all spokes simultaneously. Lowest fan-out latency; hub is the single point of failure.",
    goodFor: "Fan-out broadcast tasks — distributing identical subtasks to many workers at once.",
    bossIdx: 6,
    nodes: [...ring(6, CX, CY, 84), { x: CX, y: CY }],
    edges: Array.from({ length: 6 }, (_, i) => [6, i] as [number,number]),
    waves: [[6],[0,1,2,3,4,5]],
  },

  hybrid: {
    label: "Hybrid",
    badge: "hub+ring",
    note: "Hub connects to every spoke; spokes also form a ring. Combines star speed with ring-level fault resilience.",
    goodFor: "Multi-layer workflows needing both central broadcast and fallback ring routing if the hub is slow.",
    bossIdx: 0,
    nodes: [{ x: CX, y: CY }, ...ring(6, CX, CY, 82)],
    edges: [
      [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
      [1,2],[2,3],[3,4],[4,5],[5,6],[6,1],
    ],
    waves: [[0],[1,4],[2,3,5,6]],
  },

  adaptive: {
    label: "Adaptive",
    badge: "dynamic",
    note: "Topology reconfigures under load. Starts as a ring; shortcut links emerge mid-run as hot paths are detected.",
    goodFor: "Dynamic workloads where load patterns shift and the network should self-optimize over time.",
    nodes: ring(9, CX, 107, 78),
    edges: Array.from({ length: 9 }, (_, i) => [i, (i+1)%9] as [number,number]),
    peerEdges: [[0,3],[0,6],[3,6],[1,5],[2,7]],
    waves: [[0,1,2],[3,4,5],[6,7,8]],
  },
};

const PRIMARY: TopoKey[]   = ["hierarchical", "mesh", "hierarchical-mesh"];
const SECONDARY: TopoKey[] = ["ring", "star", "hybrid", "adaptive"];

export function SwarmSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number | null>(null);

  const [topo, setTopo]     = useState<TopoKey>("hierarchical");
  const [status, setStatus] = useState<Status>("idle");

  const topoRef    = useRef<TopoKey>("hierarchical");
  const frameCount = useRef<number[]>([]);
  const doneFlags  = useRef<boolean[]>([]);

  const initAnim = useCallback((key: TopoKey) => {
    const def = TOPOS[key];
    frameCount.current = def.nodes.map(() => 0);
    doneFlags.current  = def.nodes.map(() => false);
    topoRef.current    = key;
  }, []);

  // Re-init when topology switches
  useEffect(() => { initAnim(topo); }, [topo, initAnim]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== CW * dpr) {
      canvas.width  = CW * dpr;
      canvas.height = CH * dpr;
      canvas.style.width  = `${CW}px`;
      canvas.style.height = `${CH}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, CW, CH);
    const def    = TOPOS[topoRef.current];
    const frames = frameCount.current;
    const done   = doneFlags.current;

    // --- Edges ---
    def.edges.forEach(([a, b]) => {
      if (a >= def.nodes.length || b >= def.nodes.length) return;
      const na = def.nodes[a], nb = def.nodes[b];
      const lit = (frames[a] > 0 || done[a]) && (frames[b] > 0 || done[b]);
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = lit ? GOLD_M : GOLD_F;
      ctx.lineWidth   = lit ? 1.5 : 0.8;
      ctx.setLineDash(lit ? [] : [4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // --- Peer edges (dashed, lighter) ---
    def.peerEdges?.forEach(([a, b]) => {
      if (a >= def.nodes.length || b >= def.nodes.length) return;
      const na = def.nodes[a], nb = def.nodes[b];
      const lit = (frames[a] > 0 || done[a]) && (frames[b] > 0 || done[b]);
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = lit ? "rgba(200,169,126,0.65)" : "rgba(200,169,126,0.13)";
      ctx.lineWidth   = lit ? 1.2 : 0.7;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // --- Nodes ---
    def.nodes.forEach((n, i) => {
      if (i >= frames.length) return;
      const isBoss  = def.bossIdx === i;
      const isActive = frames[i] > 0;
      const isDone   = done[i];
      const nr = isBoss ? BOSS_R : NODE_R;

      // Glow ring
      if (isActive || isDone) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, nr + 6, 0, Math.PI * 2);
        ctx.fillStyle = isDone ? "rgba(100,200,120,0.10)" : "rgba(200,169,126,0.12)";
        ctx.fill();
      }

      // Node body
      ctx.beginPath();
      ctx.arc(n.x, n.y, nr, 0, Math.PI * 2);
      ctx.fillStyle   = isDone ? GREEN_F : isActive ? GOLD_F : isBoss ? GOLD : "rgba(200,169,126,0.07)";
      ctx.strokeStyle = isDone ? GREEN_R : (isActive || isBoss) ? GOLD : GOLD_F;
      ctx.lineWidth   = isBoss ? 1.5 : 1;
      ctx.fill();
      ctx.stroke();

      // Label
      if (isBoss || isDone || isActive) {
        ctx.font = `bold ${isBoss ? 8 : 7}px sans-serif`;
        ctx.fillStyle = isDone
          ? "rgba(60,180,80,0.9)"
          : isBoss
          ? ESPRESSO
          : GOLD;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(isDone ? "✓" : isBoss ? "AI" : "●", n.x, n.y);
      }

      // Tick down
      if (frames[i] > 0) {
        frames[i]--;
        if (frames[i] === 0) done[i] = true;
      }
    });

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const switchTopo = useCallback((key: TopoKey) => {
    setTopo(key);
    setStatus("idle");
    initAnim(key);
  }, [initAnim]);

  const runSwarm = useCallback(() => {
    if (status === "running") return;
    setStatus("running");

    const key = topoRef.current;
    const def = TOPOS[key];
    frameCount.current = def.nodes.map(() => 0);
    doneFlags.current  = def.nodes.map(() => false);

    def.waves.forEach((wave, wi) => {
      setTimeout(() => {
        wave.forEach(idx => { frameCount.current[idx] = ACTIVE_FRAMES; });
      }, wi * WAVE_MS);
    });

    const done = def.waves.length * WAVE_MS + (ACTIVE_FRAMES / 60) * 1000 + 400;
    setTimeout(() => setStatus("done"), done);
  }, [status]);

  const reset = useCallback(() => {
    setStatus("idle");
    initAnim(topo);
  }, [topo, initAnim]);

  const def = TOPOS[topo];

  return (
    <div className="flex flex-col gap-3 w-full rounded-2xl bg-ivory-warm border border-ivory-linen p-4">
      <p className="text-xs tracking-label text-gold-bronze uppercase">Agent Swarm</p>

      {/* Topology selector */}
      <div className="flex flex-wrap items-center gap-1.5">
        {PRIMARY.map(key => {
          const t = TOPOS[key];
          const on = topo === key;
          return (
            <button
              key={key}
              onClick={() => switchTopo(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background:   on ? ESPRESSO : "rgba(42,35,24,0.04)",
                color:        on ? GOLD : "rgba(42,35,24,0.55)",
                border:       `1px solid ${on ? GOLD : "rgba(200,169,126,0.22)"}`,
              }}
            >
              {t.label}
              <span
                className="hidden sm:inline text-[9px] font-normal opacity-70 border rounded px-1 py-px"
                style={{ borderColor: on ? `${GOLD}50` : "rgba(200,169,126,0.25)" }}
              >
                {t.badge}
              </span>
            </button>
          );
        })}

        <span className="text-gold/20 mx-1">·</span>

        {SECONDARY.map(key => {
          const on = topo === key;
          return (
            <button
              key={key}
              onClick={() => switchTopo(key)}
              className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150"
              style={{
                background:  on ? "rgba(42,35,24,0.08)" : "transparent",
                color:       on ? "rgba(42,35,24,0.72)" : "rgba(42,35,24,0.35)",
                border:      `1px solid ${on ? "rgba(200,169,126,0.35)" : "rgba(200,169,126,0.14)"}`,
              }}
            >
              {TOPOS[key].label}
            </button>
          );
        })}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        className="rounded-xl self-center"
        style={{ background: IVORY, width: CW, height: CH }}
      />

      {/* Topology note */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-[10px] font-mono text-espresso/40 leading-snug">{def.note}</p>
        <p className="text-[10px] font-mono leading-snug">
          <span style={{ color: GOLD }} className="opacity-70">Good for:</span>{" "}
          <span className="text-espresso/45">{def.goodFor}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {status !== "done" ? (
          <button
            onClick={runSwarm}
            disabled={status === "running"}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: ESPRESSO, color: GOLD, border: `1px solid ${GOLD}` }}
          >
            {status === "running" ? "Running…" : "Run Swarm →"}
          </button>
        ) : (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: "transparent", color: GOLD, border: `1px solid rgba(200,169,126,0.35)` }}
          >
            ↺ Run again
          </button>
        )}
        <span className="text-xs font-mono text-gold-bronze">
          {status === "idle"    && "● idle"}
          {status === "running" && "◌ running"}
          {status === "done"    && "✓ complete"}
        </span>
      </div>
    </div>
  );
}
