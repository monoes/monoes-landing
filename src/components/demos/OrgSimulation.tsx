"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type RunStatus = "idle" | "typing" | "running" | "done";

interface SpecialistDef {
  id: string;
  label: string;
  abbr: string;   // 2-char abbreviation for canvas
  assignMsg: string;
  doneMsg: string;
}

interface SpecialistState extends SpecialistDef {
  status: "idle" | "working" | "complete";
}

const CREATE_CMD = '/mastermind:createorg --name dev-team --auto "Build and ship features end-to-end"';

// Peer connections drawn at the specialist row level
const PEER_PAIRS: [number, number][] = [
  [0, 1], // Architect ↔ Developer (spec → implementation)
  [1, 3], // Developer ↔ Reviewer (PR → review)
];

const SPECIALISTS: SpecialistDef[] = [
  {
    id: "architect",
    label: "Software Architect",
    abbr: "Ar",
    assignMsg: "→ Software Architect: reading spec, drafting architecture.md",
    doneMsg: "✓ Software Architect: architecture.md committed · 847 tokens",
  },
  {
    id: "developer",
    label: "Senior Developer",
    abbr: "Dv",
    assignMsg: "→ Senior Developer: implementing auth/jwt-refresh.ts",
    doneMsg: "✓ Senior Developer: opened PR #47 · feat/jwt-refresh",
  },
  {
    id: "qa",
    label: "QA Engineer",
    abbr: "QA",
    assignMsg: "→ QA Engineer: writing tests for token rotation",
    doneMsg: "✓ QA Engineer: 18 tests · 94% coverage · 0 failures",
  },
  {
    id: "reviewer",
    label: "Code Reviewer",
    abbr: "Rv",
    assignMsg: "→ Code Reviewer: scanning PR · OWASP check · style review",
    doneMsg: "✓ Code Reviewer: approved · 2 inline suggestions",
  },
  {
    id: "devops",
    label: "DevOps Automator",
    abbr: "Op",
    assignMsg: "→ DevOps Automator: CI passed, deploying to production",
    doneMsg: "✓ DevOps Automator: deployed · health check OK",
  },
];

const GOLD       = "#C8A97E";
const GOLD_FAINT = "rgba(200,169,126,0.25)";
const GOLD_MID   = "rgba(200,169,126,0.75)";
const GREEN_GLOW = "rgba(72,187,120,0.30)";
const GREEN_RING = "rgba(72,187,120,0.9)";
const GREEN_FILL = "rgba(72,187,120,0.25)";
const ESPRESSO   = "#2A2318";
const DARK_BG    = "#140e08";

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

// 5 evenly-spaced x positions (margin 40, step 110)
const SPEC_X = SPECIALISTS.map((_, i) => 40 + i * 110);

export function OrgSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number | null>(null);

  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [cmdTyped, setCmdTyped]   = useState("");
  const [bossPulse, setBossPulse] = useState(false);
  const [specialists, setSpecialists] = useState<SpecialistState[]>(
    SPECIALISTS.map((s) => ({ ...s, status: "idle" }))
  );
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const specsRef    = useRef(specialists);
  const pulseRef    = useRef(bossPulse);
  useEffect(() => { specsRef.current = specialists; }, [specialists]);
  useEffect(() => { pulseRef.current = bossPulse; }, [bossPulse]);

  // Auto-scroll log to bottom whenever a new line is added
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  // Clear any pending timers on unmount
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

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
      ctx.strokeStyle = bothActive ? GOLD_MID : "rgba(200,169,126,0.3)";
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
        ctx.fillStyle = complete ? GREEN_GLOW : "rgba(200,169,126,0.2)";
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(sx, SY, SR, 0, Math.PI * 2);
      ctx.fillStyle = complete ? GREEN_FILL : working ? "rgba(200,169,126,0.2)" : "rgba(42,35,24,0.7)";
      ctx.strokeStyle = complete ? GREEN_RING : working ? GOLD : "rgba(200,169,126,0.4)";
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();

      // Abbr / checkmark
      ctx.font = "bold 9.5px sans-serif";
      ctx.fillStyle = complete ? "#48bb78" : working ? GOLD : "rgba(250,247,240,0.85)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(complete ? "✓" : sp.abbr, sx, SY);

      // Label below
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "rgba(250,247,240,0.7)";
      ctx.fillText(sp.label, sx, SY + SR + 11);
    });

    // --- Boss node ---
    const pr = pulse ? BR + 4 : BR;

    ctx.beginPath();
    ctx.arc(BX, BY, pr + 9, 0, Math.PI * 2);
    ctx.fillStyle = pulse ? "rgba(200,169,126,0.25)" : "transparent";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(BX, BY, pr, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();

    ctx.font = "bold 10.5px sans-serif";
    ctx.fillStyle = ESPRESSO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Lead", BX, BY);

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  const runOrg = useCallback(() => {
    if (runStatus !== "idle" && runStatus !== "done") return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setRunStatus("typing");
    setCmdTyped("");
    setBossPulse(false);
    setLog([]);
    setSpecialists(SPECIALISTS.map((s) => ({ ...s, status: "idle" })));

    // Type out the create-org command, then hand off to the run sequence.
    let i = 0;
    const typeTick = () => {
      i++;
      setCmdTyped(CREATE_CMD.slice(0, i));
      if (i < CREATE_CMD.length) {
        schedule(typeTick, 14);
      } else {
        schedule(startRun, 450);
      }
    };
    schedule(typeTick, 14);

    function startRun() {
      setRunStatus("running");
      setBossPulse(true);
      setLog(["◆ Engineering Lead: spawning dev team · 5 specialists online"]);

      SPECIALISTS.forEach((sp, i) => {
        const assignAt   = 300 + i * 480;
        const completeAt = assignAt + 820;

        schedule(() => {
          setSpecialists((prev) =>
            prev.map((s) => (s.id === sp.id ? { ...s, status: "working" } : s))
          );
          setLog((prev) => [...prev, sp.assignMsg]);
        }, assignAt);

        schedule(() => {
          setSpecialists((prev) =>
            prev.map((s) => (s.id === sp.id ? { ...s, status: "complete" } : s))
          );
          setLog((prev) => [...prev, sp.doneMsg]);
        }, completeAt);
      });

      const last = 300 + (SPECIALISTS.length - 1) * 480 + 820 + 500;
      schedule(() => {
        setBossPulse(false);
        setRunStatus("done");
        setLog((prev) => [...prev, "◆ Sprint complete · 1 feature · 18 tests · PR merged · 4m 22s"]);
      }, last);
    }
  }, [runStatus, schedule]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRunStatus("idle");
    setCmdTyped("");
    setBossPulse(false);
    setSpecialists(SPECIALISTS.map((s) => ({ ...s, status: "idle" })));
    setLog([]);
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full rounded-2xl bg-espresso-deep/90 border border-gold/20 p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-label text-gold uppercase font-semibold">
          Autonomous Org · dev-team
        </p>
        <span className="text-[10px] font-mono text-ivory/30 lowercase">simulated</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Typed command bar */}
        <div
          className="rounded-lg border border-gold/15 bg-black/40 px-3.5 py-2 font-mono text-[11px] leading-relaxed min-h-[32px] flex items-baseline gap-2"
          style={{ color: "rgba(250,247,240,0.85)" }}
        >
          <span className="text-gold shrink-0">$</span>
          <span className="break-all">{cmdTyped}</span>
          {(runStatus === "typing") && (
            <span className="inline-block w-[6px] h-[12px] bg-gold animate-pulse align-text-bottom" />
          )}
        </div>

        {/* Canvas, scrollable on narrow screens */}
        <div className="overflow-x-auto rounded-xl border border-gold/15" style={{ background: DARK_BG }}>
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="block rounded-xl"
            style={{ minWidth: CW, background: DARK_BG }}
          />
        </div>

        {/* Activity log */}
        <div
          ref={logRef}
          className="rounded-xl border border-gold/15 bg-[#100a05] px-4 py-3 font-mono text-xs leading-relaxed min-h-[80px] max-h-[140px] overflow-y-auto scroll-smooth"
          style={{ color: "rgba(250,247,240,0.75)" }}
        >
          {log.length === 0 ? (
            <span className="text-ivory/30">Activity log…</span>
          ) : (
            log.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.startsWith("✓")
                    ? "#48bb78"
                    : line.startsWith("◆")
                    ? GOLD
                    : "rgba(250,247,240,0.75)",
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
            disabled={runStatus === "typing" || runStatus === "running"}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 hover:bg-gold-warm"
            style={{ background: GOLD, color: ESPRESSO }}
          >
            {runStatus === "idle" && "Run Org →"}
            {runStatus === "typing" && "Typing…"}
            {runStatus === "running" && "Running…"}
          </button>
        )}

        {runStatus === "done" && (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gold/15"
            style={{ background: "transparent", color: GOLD, border: `1px solid ${GOLD}60` }}
          >
            ↺ Run again
          </button>
        )}

        <span className="text-xs font-mono text-gold/70">
          {runStatus === "idle"    && "● idle"}
          {runStatus === "typing"  && "◌ typing"}
          {runStatus === "running" && "◌ coordinating"}
          {runStatus === "done"    && "✓ Complete"}
        </span>
      </div>
    </div>
  );
}
