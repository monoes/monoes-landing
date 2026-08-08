"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type Phase = "idle" | "scanning" | "indexing" | "detecting" | "done";

const GOLD    = "#C8A97E";
const GOLD_F  = "rgba(200,169,126,0.18)";
const ESPRESSO = "#2A2318";
const IVORY   = "#FAF7F0";

// Community accent colors
const COMM_RING = ["#C8A97E", "#8CC8A0", "#88A4CC"];
const COMM_FILL = ["rgba(200,169,126,0.20)", "rgba(140,200,160,0.20)", "rgba(136,164,204,0.20)"];
const COMM_LABEL = ["Backend / API", "Data & Docs", "UI & Features"];

interface GNode {
  id:        number;
  label:     string;
  sublabel:  string;
  x:         number;
  y:         number;
  comm:      number;
  god?:      boolean;
}

const NODES: GNode[] = [
  // Community 0 — Backend / API
  { id: 0,  label: "API",    sublabel: "REST endpoints",   x: 118, y: 52,  comm: 0, god: true },
  { id: 1,  label: "Auth",   sublabel: "authentication",   x: 52,  y: 118, comm: 0 },
  { id: 2,  label: "Server", sublabel: "HTTP server",      x: 184, y: 118, comm: 0 },
  { id: 3,  label: "Config", sublabel: "env & secrets",    x: 88,  y: 178, comm: 0 },
  // Community 1 — Data & Docs
  { id: 4,  label: "DB",     sublabel: "database layer",   x: 280, y: 40,  comm: 1, god: true },
  { id: 5,  label: "Users",  sublabel: "user model",       x: 228, y: 108, comm: 1 },
  { id: 6,  label: "Schema", sublabel: "data schema",      x: 334, y: 108, comm: 1 },
  { id: 7,  label: "Docs",   sublabel: "README & specs",   x: 280, y: 172, comm: 1 },
  // Community 2 — UI & Features
  { id: 8,  label: "UI",     sublabel: "components",       x: 442, y: 52,  comm: 2, god: true },
  { id: 9,  label: "Forms",  sublabel: "form logic",       x: 386, y: 120, comm: 2 },
  { id: 10, label: "Search", sublabel: "full-text search", x: 502, y: 120, comm: 2 },
  { id: 11, label: "Pay",    sublabel: "payments",         x: 442, y: 185, comm: 2 },
];

const EDGES: [number, number][] = [
  // Backend intra
  [0,1],[0,2],[0,3],[1,3],[2,3],
  // Data intra
  [4,5],[4,6],[4,7],[5,6],[5,7],
  // UI intra
  [8,9],[8,10],[9,11],[10,11],[8,11],
  // Cross-community dependencies
  [0,4],[0,8],[1,5],[4,8],[6,9],[3,7],
];

const NODE_R = 13;
const GOD_R  = 18;
const CW = 560, CH = 210;

const SCAN_STEPS = [
  "Scanning 127 source files…",
  "Extracting 843 AST nodes (functions, classes, types)…",
  "Building function call graph…",
  "Tracing 1,204 import and dependency edges…",
  "Mapping 3 module clusters…",
  `Indexed ${NODES.length} concepts, ${EDGES.length} edges into SQLite.`,
];

const DETECT_STEPS = [
  "Running Louvain community detection…",
  "Found 3 communities (modularity Q=0.41).",
  "Detected 3 god nodes: API · DB · UI",
  "graphQuality = avgCohesion × ln(1 + avgDegree) = 2.87",
  "Graph ready — impact paths and 46 MCP tools active (19 default + 27 advanced).",
];

export function MonographDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number | null>(null);
  const logRef    = useRef<HTMLDivElement>(null);

  const [phase, setPhase]           = useState<Phase>("idle");
  const [visibleNodes, setVisible]  = useState<Set<number>>(new Set());
  const [visibleEdges, setEdges]    = useState<Set<string>>(new Set());
  const [commsActive, setComms]     = useState(false);
  const [log, setLog]               = useState<string[]>([]);
  const [highlightPath, setHPath]   = useState<number[]>([]);

  const visRef    = useRef<Set<number>>(new Set());
  const edgeRef   = useRef<Set<string>>(new Set());
  const commsRef  = useRef(false);
  const pathRef   = useRef<number[]>([]);

  useEffect(() => { visRef.current   = visibleNodes; }, [visibleNodes]);
  useEffect(() => { edgeRef.current  = visibleEdges; }, [visibleEdges]);
  useEffect(() => { commsRef.current = commsActive;  }, [commsActive]);
  useEffect(() => { pathRef.current  = highlightPath;}, [highlightPath]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const addLog = useCallback((line: string) => {
    setLog(prev => [...prev, line]);
  }, []);

  // rAF draw loop
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
    const vis   = visRef.current;
    const evis  = edgeRef.current;
    const comms = commsRef.current;
    const path  = pathRef.current;

    // --- Community halos (drawn behind everything) ---
    if (comms) {
      [0, 1, 2].forEach(c => {
        const members = NODES.filter(n => n.comm === c && vis.has(n.id));
        if (members.length === 0) return;
        // Convex-hull approximation: just draw expanded circles per node
        members.forEach(n => {
          const r = (n.god ? GOD_R : NODE_R) + 14;
          const grad = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, r);
          grad.addColorStop(0, COMM_FILL[c]);
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      });
    }

    // --- Edges ---
    EDGES.forEach(([a, b]) => {
      const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
      if (!evis.has(key)) return;
      const na = NODES[a], nb = NODES[b];
      const onPath = path.includes(a) && path.includes(b) &&
        Math.abs(path.indexOf(a) - path.indexOf(b)) === 1;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = onPath ? GOLD : "rgba(200,169,126,0.28)";
      ctx.lineWidth   = onPath ? 2 : 0.9;
      ctx.setLineDash(onPath ? [] : []);
      ctx.stroke();
    });

    // --- Nodes ---
    NODES.forEach(n => {
      if (!vis.has(n.id)) return;
      const nr = n.god ? GOD_R : NODE_R;
      const ring = COMM_RING[n.comm];
      const fill = COMM_FILL[n.comm];
      const onPath = path.includes(n.id);

      // Outer glow for god nodes
      if (n.god) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, nr + 7, 0, Math.PI * 2);
        ctx.fillStyle = onPath ? "rgba(200,169,126,0.20)" : `${ring}22`;
        ctx.fill();
      }

      // Node body
      ctx.beginPath();
      ctx.arc(n.x, n.y, nr, 0, Math.PI * 2);
      ctx.fillStyle   = onPath ? "rgba(200,169,126,0.35)" : fill;
      ctx.strokeStyle = onPath ? GOLD : ring;
      ctx.lineWidth   = onPath ? 2 : 1.2;
      ctx.fill();
      ctx.stroke();

      // Label inside node
      ctx.font = `bold ${n.god ? 8 : 7}px sans-serif`;
      ctx.fillStyle   = onPath ? ESPRESSO : ESPRESSO;
      ctx.textAlign   = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.label, n.x, n.y);

      // Sublabel below (only when communities visible)
      if (comms) {
        ctx.font = "6.5px sans-serif";
        ctx.fillStyle = "rgba(42,35,24,0.38)";
        ctx.fillText(n.sublabel, n.x, n.y + nr + 9);
      }
    });

    // Community legend (when communities active)
    if (comms) {
      [0, 1, 2].forEach((c, i) => {
        const lx = 8, ly = 10 + i * 16;
        ctx.beginPath();
        ctx.arc(lx + 5, ly + 4, 5, 0, Math.PI * 2);
        ctx.fillStyle = COMM_FILL[c];
        ctx.strokeStyle = COMM_RING[c];
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.font = "8px sans-serif";
        ctx.fillStyle = "rgba(42,35,24,0.55)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(COMM_LABEL[c], lx + 14, ly + 4);
      });
    }

    // eslint-disable-next-line react-hooks/immutability -- self-recursive rAF loop
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const runBuild = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("scanning");
    setVisible(new Set());
    setEdges(new Set());
    setComms(false);
    setLog([]);
    setHPath([]);

    addLog("◆ monograph_build — scanning codebase…");

    // Phase 1: scan → nodes appear
    SCAN_STEPS.forEach((msg, i) => {
      setTimeout(() => addLog(`  ${msg}`), i * 320 + 100);
    });
    NODES.forEach((n, i) => {
      setTimeout(() => {
        setVisible(prev => new Set([...prev, n.id]));
      }, i * 160 + 200);
    });

    const edgeStart = NODES.length * 160 + 400;

    // Phase 2: index → edges appear
    setTimeout(() => {
      setPhase("indexing");
      addLog("◆ Indexing dependencies…");
    }, edgeStart);

    EDGES.forEach(([a, b], i) => {
      const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
      setTimeout(() => {
        setEdges(prev => new Set([...prev, key]));
      }, edgeStart + i * 80 + 100);
    });

    const detectStart = edgeStart + EDGES.length * 80 + 500;

    // Phase 3: detect communities
    setTimeout(() => {
      setPhase("detecting");
      addLog("◆ Detecting communities…");
    }, detectStart);

    DETECT_STEPS.forEach((msg, i) => {
      setTimeout(() => addLog(`  ${msg}`), detectStart + i * 380 + 100);
    });

    setTimeout(() => setComms(true), detectStart + 200);

    // Phase 4: impact path highlight
    const doneAt = detectStart + DETECT_STEPS.length * 380 + 600;
    setTimeout(() => {
      setPhase("done");
      addLog("◆ Graph ready — impact paths and MCP tools active.");
      // Highlight example impact path: API → DB → Users → Docs
      setHPath([0, 4, 5, 7]);
      addLog("  Impact path: API → DB → Users → Docs");
    }, doneAt);
  }, [phase, addLog]);

  const reset = useCallback(() => {
    setPhase("idle");
    setVisible(new Set());
    setEdges(new Set());
    setComms(false);
    setLog([]);
    setHPath([]);
  }, []);

  const godNodes = NODES.filter(n => n.god);

  return (
    <div className="flex flex-col gap-3 w-full rounded-2xl bg-ivory-warm border border-ivory-linen p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-label text-gold-bronze uppercase">Monograph · Knowledge Graph</p>
        <div className="flex gap-2">
          {godNodes.map(n => (
            <span
              key={n.id}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
              style={{ color: COMM_RING[n.comm], borderColor: `${COMM_RING[n.comm]}40`, background: COMM_FILL[n.comm] }}
            >
              ★ {n.label}
            </span>
          ))}
          <span className="text-[9px] font-mono text-espresso/30 self-center">god nodes</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-x-auto rounded-xl" style={{ background: IVORY }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="block rounded-xl"
          style={{ minWidth: CW, background: IVORY }}
        />
      </div>

      {/* Log */}
      <div
        ref={logRef}
        className="rounded-xl border border-gold/10 bg-espresso/5 px-4 py-3 font-mono text-xs leading-relaxed min-h-[60px] max-h-[130px] overflow-y-auto scroll-smooth"
        style={{ color: "rgba(42,35,24,0.55)" }}
      >
        {log.length === 0 ? (
          <span className="opacity-35">Activity log…</span>
        ) : (
          log.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.startsWith("◆")
                  ? GOLD
                  : line.includes("path:")
                  ? GOLD
                  : "rgba(42,35,24,0.60)",
              }}
            >
              {line}
            </div>
          ))
        )}
      </div>

      {/* Description lines */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-[10px] font-mono text-espresso/40 leading-snug">
          AST-parsed dependency graph of any codebase. Louvain clustering groups files into logical communities. God nodes (API, DB, UI) are highly-connected hubs — changing them has the widest blast radius.
        </p>
        <p className="text-[10px] font-mono leading-snug">
          <span style={{ color: GOLD }} className="opacity-70">Good for:</span>{" "}
          <span className="text-espresso/45">Understanding blast radius before edits, finding dead code, routing agents to the right files automatically.</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {phase !== "done" ? (
          <button
            onClick={runBuild}
            disabled={phase !== "idle"}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: ESPRESSO, color: GOLD, border: `1px solid ${GOLD}` }}
          >
            {phase === "idle"      && "Build Graph →"}
            {phase === "scanning"  && "Scanning…"}
            {phase === "indexing"  && "Indexing…"}
            {phase === "detecting" && "Detecting…"}
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
          {phase === "idle"      && "● idle"}
          {phase === "scanning"  && "◌ scanning"}
          {phase === "indexing"  && "◌ indexing"}
          {phase === "detecting" && "◌ detecting"}
          {phase === "done"      && "✓ complete"}
        </span>
      </div>
    </div>
  );
}
