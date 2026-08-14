"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Node {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  category: "trigger" | "browser" | "ai" | "output";
}

const NODES: Node[] = [
  { id: "cron",   label: "Cron Trigger",   icon: "⏰", x: 60,  y: 60,  category: "trigger"  },
  { id: "chrome", label: "Open Chrome",    icon: "🌐", x: 260, y: 60,  category: "browser"  },
  { id: "scrape", label: "Scrape Data",    icon: "🔍", x: 460, y: 60,  category: "browser"  },
  { id: "ai",     label: "AI Generate",    icon: "✨", x: 260, y: 180, category: "ai"       },
  { id: "filter", label: "Filter Results", icon: "⚡", x: 460, y: 180, category: "ai"       },
  { id: "post",   label: "Post Content",   icon: "📤", x: 360, y: 300, category: "output"   },
];

const EDGES = [
  { from: "cron",   to: "chrome" },
  { from: "chrome", to: "scrape" },
  { from: "chrome", to: "ai"     },
  { from: "scrape", to: "filter" },
  { from: "ai",     to: "filter" },
  { from: "filter", to: "post"   },
];

const CATEGORY_COLOR: Record<Node["category"], string> = {
  trigger: "#C8A97E",
  browser: "#8B7355",
  ai:      "#B8956A",
  output:  "#A07840",
};

const NODE_W = 140;
const NODE_H = 60;
const BASE_CANVAS_W = 700;
const CANVAS_H = 380;

export function WorkflowBuilder() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNode,  setActiveNode]  = useState<string | null>(null);
  const [running,     setRunning]     = useState(false);
  const [runIdx,      setRunIdx]      = useState(-1);
  const [canvasWidth, setCanvasWidth] = useState(BASE_CANVAS_W);
  const runTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // execution path through the DAG
  const RUN_SEQ = ["cron", "chrome", "scrape", "ai", "filter", "post"];

  // Update canvas width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Account for p-4 padding (16px on each side = 32px total)
        const availableWidth = containerWidth - 32;
        setCanvasWidth(Math.min(BASE_CANVAS_W, availableWidth));
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate scale factor for responsive node positioning
  const scale = canvasWidth / BASE_CANVAS_W;

  // Canvas is inset-4 (16px from container left); subtract that offset so
  // drawn edges align with the absolutely-positioned node divs.
  const CANVAS_OFFSET_X = 16;
  const getCenter = (node: Node) => ({
    x: (node.x * scale) - CANVAS_OFFSET_X + (NODE_W * scale) / 2,
    y: node.y + (NODE_H * scale) / 2,
  });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvasWidth * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width  = canvasWidth + "px";
    canvas.style.height = CANVAS_H + "px";
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasWidth, CANVAS_H);

    EDGES.forEach((edge) => {
      const fn = NODES.find((n) => n.id === edge.from)!;
      const tn = NODES.find((n) => n.id === edge.to)!;
      const fc = getCenter(fn);
      const tc = getCenter(tn);

      const runningIdx = RUN_SEQ.indexOf(edge.from);
      const isLit = running && runIdx >= runningIdx && runIdx > RUN_SEQ.indexOf(edge.to) - 1;
      const isHover = activeNode === edge.from || activeNode === edge.to;

      const dx = tc.x - fc.x;
      const dy = tc.y - fc.y;

      const scaledNodeW = NODE_W * scale;
      const scaledNodeH = NODE_H * scale;

      let sx: number, sy: number, ex: number, ey: number;
      if (Math.abs(dx) >= Math.abs(dy)) {
        // primarily horizontal: connect left/right edges
        sx = fc.x + (dx > 0 ? scaledNodeW / 2 : -scaledNodeW / 2);
        sy = fc.y;
        ex = tc.x + (dx > 0 ? -scaledNodeW / 2 : scaledNodeW / 2);
        ey = tc.y;
      } else {
        // primarily vertical: connect top/bottom edges
        sx = fc.x;
        sy = fc.y + (dy > 0 ? scaledNodeH / 2 : -scaledNodeH / 2);
        ex = tc.x;
        ey = tc.y + (dy > 0 ? -scaledNodeH / 2 : scaledNodeH / 2);
      }

      ctx.beginPath();
      ctx.setLineDash(isLit ? [] : [5, 4]);
      ctx.moveTo(sx, sy);
      // bezier curve for diagonals, straight line for axis-aligned
      if (Math.abs(dx) > 10 && Math.abs(dy) > 10) {
        const cpx = sx + (ex - sx) * 0.5;
        ctx.bezierCurveTo(cpx, sy, cpx, ey, ex, ey);
      } else {
        ctx.lineTo(ex, ey);
      }
      ctx.strokeStyle = isLit ? "#C8A97E" : isHover ? "#8B7355" : "rgba(255,255,240,0.12)";
      ctx.lineWidth = isLit ? 2 : 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }, [activeNode, running, runIdx, canvasWidth, scale]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const startRun = () => {
    if (running) return;
    setRunning(true);
    setRunIdx(0);
    setActiveNode(null);
    let i = 0;
    runTimer.current = setInterval(() => {
      i++;
      setRunIdx(i);
      if (i >= RUN_SEQ.length) {
        clearInterval(runTimer.current!);
        setTimeout(() => { setRunning(false); setRunIdx(-1); }, 1000);
      }
    }, 650);
  };

  useEffect(() => () => { if (runTimer.current) clearInterval(runTimer.current); }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-espresso/10 bg-espresso overflow-hidden select-none"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-ivory/6 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-ivory/10" />
            <span className="h-3 w-3 rounded-full bg-ivory/10" />
            <span className="h-3 w-3 rounded-full bg-ivory/10" />
          </div>
          <p className="text-xs uppercase tracking-label text-ivory/40 font-medium ml-2">
            Workflow DAG: Content Autopilot
          </p>
        </div>
        <button
          onClick={startRun}
          disabled={running}
          className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium transition-all"
          style={{
            background: running ? "rgba(200,169,126,0.15)" : "#C8A97E",
            color: running ? "#C8A97E" : "#2A2318",
          }}
        >
          {running ? (
            <>
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              Running…
            </>
          ) : (
            <>▶ Run Workflow</>
          )}
        </button>
      </div>

      {/* Canvas area */}
      <div className="relative p-4" style={{ height: CANVAS_H + 32 }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-4 pointer-events-none"
          style={{ width: canvasWidth, height: CANVAS_H, maxWidth: "100%" }}
        />

        {/* Nodes */}
        {NODES.map((node) => {
          const isActive  = activeNode === node.id;
          const runSeqIdx = RUN_SEQ.indexOf(node.id);
          const isDone    = running && runIdx > runSeqIdx;
          const isCurrent = running && runIdx === runSeqIdx;
          const color     = CATEGORY_COLOR[node.category];

          return (
            <button
              key={node.id}
              onClick={() => !running && setActiveNode((p) => p === node.id ? null : node.id)}
              className="absolute flex flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-200"
              style={{
                left: node.x * scale,
                top: node.y + 16,
                width: NODE_W * scale,
                height: NODE_H * scale,
                background: isCurrent
                  ? `${color}22`
                  : isDone
                  ? "rgba(255,255,240,0.06)"
                  : isActive
                  ? "rgba(255,255,240,0.08)"
                  : "rgba(255,255,240,0.04)",
                borderColor: isCurrent
                  ? color
                  : isDone
                  ? "rgba(255,255,240,0.15)"
                  : isActive
                  ? "rgba(255,255,240,0.2)"
                  : "rgba(255,255,240,0.08)",
                borderWidth: isCurrent ? 1.5 : 1,
                boxShadow: isCurrent
                  ? `0 0 20px ${color}30`
                  : "none",
                transform: `scale(${isCurrent ? 1.05 : 1})`,
              }}
            >
              {/* Status dot */}
              {(isDone || isCurrent) && (
                <span
                  className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-espresso ${isCurrent ? "animate-pulse" : ""}`}
                  style={{ background: isDone ? "#5cb85c" : color }}
                />
              )}
              <span className="leading-none" style={{ fontSize: `${scale * 18}px` }}>{node.icon}</span>
              <span className="font-medium leading-tight text-center px-2"
                style={{
                  fontSize: `${scale * 12}px`,
                  color: isCurrent ? color : isDone ? "rgba(255,255,240,0.6)" : "rgba(255,255,240,0.5)"
                }}>
                {node.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="border-t border-ivory/6 px-6 py-3 flex items-center gap-6">
        {[
          { label: "Nodes", value: NODES.length },
          { label: "Edges", value: EDGES.length },
          { label: "Status", value: running ? "Executing" : runIdx >= RUN_SEQ.length - 1 && runIdx > 0 ? "Complete" : "Idle" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-ivory/30">{label}</span>
            <span className="text-xs font-mono font-medium text-ivory/60">{value}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-ivory/25">
          {running ? `Step ${Math.min(runIdx + 1, RUN_SEQ.length)} / ${RUN_SEQ.length}` : "Click ▶ to execute"}
        </div>
      </div>
    </div>
  );
}
