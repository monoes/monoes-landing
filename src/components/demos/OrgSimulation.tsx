"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type RunStatus = "idle" | "running" | "done";

interface SpecialistDef {
  id: string;
  label: string;
  abbr: string;   // 2-char abbreviation for canvas
  task: string;
}

interface SpecialistState extends SpecialistDef {
  status: "idle" | "working" | "complete";
}

// Peer connections drawn at the specialist row level
const PEER_PAIRS: [number, number][] = [
  [1, 2], // Planner ↔ Designer
  [3, 4], // Developer ↔ Reviewer
];

const SPECIALISTS: SpecialistDef[] = [
  { id: "researcher", label: "Researcher", abbr: "Re", task: "Research market patterns, docs, and prior art" },
  { id: "planner",    label: "Planner",    abbr: "Pl", task: "Translate research into sprint milestones" },
  { id: "designer",   label: "Designer",   abbr: "Ds", task: "Design UI system and component specs" },
  { id: "developer",  label: "Developer",  abbr: "Dv", task: "Implement features from planner + designer" },
  { id: "reviewer",   label: "Reviewer",   abbr: "Rv", task: "Review code quality, coverage, and diff" },
  { id: "tester",     label: "Tester",     abbr: "Ts", task: "Run test suite and report edge-case failures" },
  { id: "devops",     label: "DevOps",     abbr: "Do", task: "Deploy build, configure infra, monitor health" },
];

const GOLD       = "#C8A97E";
const GOLD_FAINT = "rgba(200,169,126,0.18)";
const GOLD_MID   = "rgba(200,169,126,0.55)";
const GREEN_GLOW = "rgba(100,200,120,0.12)";
const GREEN_RING = "rgba(100,200,120,0.7)";
const GREEN_FILL = "rgba(100,200,120,0.22)";
const ESPRESSO   = "#2A2318";
const IVORY      = "#FAF7F0";

// Canvas dimensions
const CW = 560;
const CH = 210;

// Boss position
const BX = CW / 2;
const BY = 42;
const BR = 22; // boss radius

// Specialists row
const SR = 16; // specialist radius
const SY = 163;

// 7 evenly-spaced x positions (margin 40, step 80)
const SPEC_X = SPECIALISTS.map((_, i) => 40 + i * 80);

export function OrgSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number | null>(null);

  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [bossPulse, setBossPulse] = useState(false);
  const [specialists, setSpecialists] = useState<SpecialistState[]>(
    SPECIALISTS.map((s) => ({ ...s, status: "idle" }))
  );
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const specsRef    = useRef(specialists);
  const pulseRef    = useRef(bossPulse);
  useEffect(() => { specsRef.current = specialists; }, [specialists]);
  useEffect(() => { pulseRef.current = bossPulse; }, [bossPulse]);

  // Auto-scroll log to bottom whenever a new line is added
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== CW * dpr) {
      canvas.width  = CW * dpr;
      canvas.height = CH * dpr;
      canvas.style.width  = CW + "px";
      canvas.style.height = CH + "px";
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, CW, CH);

    const specs = specsRef.current;
    const pulse = pulseRef.current;

    // --- Boss → specialist connections ---
    SPEC_X.forEach((sx, i) => {
      const active = specs[i].status !== "idle";
      ctx.beginPath();
      ctx.moveTo(BX, BY + BR + 2);
      ctx.lineTo(sx, SY - SR - 2);
      ctx.strokeStyle = active ? GOLD_MID : GOLD_FAINT;
      ctx.lineWidth   = active ? 1.5 : 0.8;
      ctx.setLineDash(active ? [] : [4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // --- Peer connections (horizontal, at specialist row) ---
    PEER_PAIRS.forEach(([a, b]) => {
      const ax = SPEC_X[a];
      const bx2 = SPEC_X[b];
      const aActive = specs[a].status !== "idle";
      const bActive = specs[b].status !== "idle";
      const bothActive = aActive && bActive;

      ctx.beginPath();
      ctx.moveTo(ax + SR + 2, SY);
      ctx.lineTo(bx2 - SR - 2, SY);
      ctx.strokeStyle = bothActive ? GOLD_MID : "rgba(200,169,126,0.25)";
      ctx.lineWidth   = bothActive ? 1.5 : 1;
      ctx.setLineDash(bothActive ? [] : [3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // --- Specialist nodes ---
    SPEC_X.forEach((sx, i) => {
      const sp      = specs[i];
      const working  = sp.status === "working";
      const complete = sp.status === "complete";

      // Glow ring
      if (working || complete) {
        ctx.beginPath();
        ctx.arc(sx, SY, SR + 7, 0, Math.PI * 2);
        ctx.fillStyle = complete ? GREEN_GLOW : "rgba(200,169,126,0.12)";
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(sx, SY, SR, 0, Math.PI * 2);
      ctx.fillStyle = complete ? GREEN_FILL : working ? GOLD_FAINT : "rgba(200,169,126,0.07)";
      ctx.strokeStyle = complete ? GREEN_RING : working ? GOLD : GOLD_FAINT;
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();

      // Abbr / checkmark
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = complete ? "rgba(60,180,80,0.9)" : working ? GOLD : GOLD_MID;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(complete ? "✓" : sp.abbr, sx, SY);

      // Label below
      ctx.font = "8.5px sans-serif";
      ctx.fillStyle = "rgba(42,35,24,0.5)";
      ctx.fillText(sp.label, sx, SY + SR + 10);
    });

    // --- Boss node ---
    const pr = pulse ? BR + 4 : BR;

    ctx.beginPath();
    ctx.arc(BX, BY, pr + 9, 0, Math.PI * 2);
    ctx.fillStyle = pulse ? "rgba(200,169,126,0.13)" : "transparent";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(BX, BY, pr, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();

    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = ESPRESSO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Boss", BX, BY);

    // eslint-disable-next-line react-hooks/immutability -- self-recursive rAF loop
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const runOrg = useCallback(() => {
    if (runStatus === "running") return;

    setRunStatus("running");
    setBossPulse(true);
    setLog(["◆ Boss is online, distributing tasks to the org…"]);
    setSpecialists(SPECIALISTS.map((s) => ({ ...s, status: "idle" })));

    SPECIALISTS.forEach((sp, i) => {
      const assignAt  = 350 + i * 420;
      const completeAt = assignAt + 780;

      setTimeout(() => {
        setSpecialists((prev) =>
          prev.map((s) => s.id === sp.id ? { ...s, status: "working" } : s)
        );
        setLog((prev) => [...prev, `→ ${sp.label}: ${sp.task}`]);
      }, assignAt);

      setTimeout(() => {
        setSpecialists((prev) =>
          prev.map((s) => s.id === sp.id ? { ...s, status: "complete" } : s)
        );
        setLog((prev) => [...prev, `✓ ${sp.label} delivered`]);
      }, completeAt);
    });

    const last = 350 + (SPECIALISTS.length - 1) * 420 + 780 + 500;
    setTimeout(() => {
      setBossPulse(false);
      setRunStatus("done");
      setLog((prev) => [...prev, "◆ All specialists done, goal delivered to Boss"]);
    }, last);
  }, [runStatus]);

  const reset = useCallback(() => {
    setRunStatus("idle");
    setSpecialists(SPECIALISTS.map((s) => ({ ...s, status: "idle" })));
    setLog([]);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full rounded-2xl bg-ivory-warm border border-ivory-linen p-4">
      <p className="text-xs tracking-label text-gold-bronze uppercase">
        Autonomous Org
      </p>

      <div className="flex flex-col gap-3">
        {/* Canvas, scrollable on narrow screens */}
        <div className="overflow-x-auto rounded-xl" style={{ background: IVORY }}>
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="block rounded-xl"
            style={{ minWidth: CW, background: IVORY }}
          />
        </div>

        {/* Activity log */}
        <div
          ref={logRef}
          className="rounded-xl border border-gold/10 bg-espresso/5 px-4 py-3 font-mono text-xs leading-relaxed min-h-[80px] max-h-[140px] overflow-y-auto scroll-smooth"
          style={{ color: "rgba(42,35,24,0.55)" }}
        >
          {log.length === 0 ? (
            <span className="opacity-35">Activity log…</span>
          ) : (
            log.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.startsWith("✓")
                    ? "rgba(50,160,70,0.85)"
                    : line.startsWith("◆")
                    ? GOLD
                    : "rgba(42,35,24,0.65)",
                }}
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {runStatus !== "done" && (
          <button
            onClick={runOrg}
            disabled={runStatus === "running"}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: ESPRESSO, color: GOLD, border: `1px solid ${GOLD}` }}
          >
            {runStatus === "running" ? "Running…" : "Run Org →"}
          </button>
        )}

        {runStatus === "done" && (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: "transparent", color: GOLD, border: `1px solid ${GOLD}40` }}
          >
            ↺ Run again
          </button>
        )}

        <span className="text-xs font-mono text-gold-bronze">
          {runStatus === "idle"    && "● idle"}
          {runStatus === "running" && "◌ coordinating"}
          {runStatus === "done"    && "✓ Complete"}
        </span>
      </div>
    </div>
  );
}
