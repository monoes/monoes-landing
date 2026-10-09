"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface IssueLine {
  num: string;
  type: "feat" | "bug";
  text: string;
}

interface WorkLine {
  role: string;
  text: string;
  ok?: boolean;
}

interface TelegramLine {
  text: string;
  ok?: boolean;
  pending?: boolean;
}

interface TelegramBubble {
  botName: string;
  lines: TelegramLine[];
  question: string;
  buttons: { label: string; approve?: boolean }[];
}

interface OrgBeat {
  icon: string;
  label: string;
  title: string;
  kind: "clock" | "issues" | "worklines" | "telegram";
  clock?: { time: string; sub: string; cycleTag: string };
  issues?: IssueLine[];
  workLines?: WorkLine[];
  telegram?: TelegramBubble;
}

export interface ScheduledOrgConfig {
  eyebrow: string;
  description: string;
  createCmd: string[];
  runCmd: string;
  beats: [OrgBeat, OrgBeat, OrgBeat, OrgBeat];
  timerLabel: string;
  timerStart: string;
  /** Tick timerStart down as mm:ss (fast-forward demo clock). If false, timerStart is shown static. */
  ticking?: boolean;
  statusLine: string;
}

const GOLD = "#C8A97E";
const ESPRESSO = "#2A2318";

function parseMmSs(v: string): number | null {
  const m = /^(\d+):(\d{2})$/.exec(v);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function formatMmSs(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function BeatCard({
  beat,
  on,
  linesRevealed,
}: {
  beat: OrgBeat;
  on: boolean;
  linesRevealed: number;
}) {
  return (
    <div
      className="rounded-[10px] border p-3.5 transition-all duration-500"
      style={{
        borderColor: on ? "rgba(200,169,126,0.4)" : "rgba(200,169,126,0.12)",
        background: on ? "rgba(200,169,126,0.04)" : "rgba(255,255,255,0.025)",
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <span className="block text-lg mb-2 leading-none">{beat.icon}</span>
      <span className="block font-mono text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: "rgba(200,169,126,0.45)" }}>
        {beat.label}
      </span>
      <div className="text-[13px] font-semibold text-ivory mb-2.5">{beat.title}</div>

      {beat.kind === "clock" && beat.clock && (
        <>
          <div className="font-mono text-lg font-bold" style={{ color: GOLD, letterSpacing: "0.06em" }}>
            {beat.clock.time}
          </div>
          <div className="font-mono text-[10px]" style={{ color: "rgba(200,169,126,0.4)" }}>
            {beat.clock.sub}
          </div>
          <span
            className="inline-block mt-1.5 font-mono text-[10px] rounded px-1.5 py-0.5"
            style={{ color: "rgba(190,220,190,0.7)", background: "rgba(190,220,190,0.07)", border: "1px solid rgba(190,220,190,0.15)" }}
          >
            {beat.clock.cycleTag}
          </span>
        </>
      )}

      {beat.kind === "issues" && beat.issues && (
        <div className="flex flex-col gap-1">
          {beat.issues.map((issue, i) => (
            <div
              key={issue.num}
              className="font-mono text-[10px] flex items-start gap-1.5 transition-all duration-300"
              style={{
                color: "rgba(250,247,240,0.65)",
                opacity: i < linesRevealed ? 1 : 0,
                transform: i < linesRevealed ? "translateX(0)" : "translateX(-8px)",
              }}
            >
              <span style={{ color: GOLD }} className="shrink-0">{issue.num}</span>
              <span
                className="text-[10px] px-1 rounded shrink-0"
                style={
                  issue.type === "feat"
                    ? { background: "rgba(100,180,255,0.12)", color: "rgba(100,180,255,0.8)" }
                    : { background: "rgba(255,120,100,0.12)", color: "rgba(255,140,120,0.8)" }
                }
              >
                {issue.type}
              </span>
              {issue.text}
            </div>
          ))}
        </div>
      )}

      {beat.kind === "worklines" && beat.workLines && (
        <div className="flex flex-col gap-1 font-mono text-[10px]">
          {beat.workLines.map((line, i) => (
            <div
              key={i}
              className="flex gap-1.5 items-center leading-snug transition-all duration-300"
              style={{
                color: line.ok ? "rgba(190,220,190,0.7)" : "rgba(250,247,240,0.55)",
                opacity: i < linesRevealed ? 1 : 0,
                transform: i < linesRevealed ? "translateX(0)" : "translateX(-6px)",
              }}
            >
              <span style={{ color: "rgba(200,169,126,0.75)" }} className="shrink-0">{line.role}</span>
              {line.text}
            </div>
          ))}
        </div>
      )}

      {beat.kind === "telegram" && beat.telegram && (
        <div
          className="rounded-[10px] rounded-bl-[4px] px-3 py-2.5 text-[10.5px] leading-relaxed"
          style={{ background: "#1d2b36", color: "#e8e8e8" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5 pb-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0"
              style={{ background: "#2d9dd6" }}
            >
              🤖
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "#2d9dd6" }}>{beat.telegram.botName}</span>
          </div>
          {beat.telegram.lines.map((line, i) => (
            <div key={i} className="flex gap-1.5 items-baseline my-0.5 text-[10px]" style={{ color: "rgba(232,232,232,0.8)" }}>
              <span style={{ color: line.ok ? "#4caf7d" : "#f0a830" }}>{line.ok ? "✅" : "⏳"}</span>
              {line.text}
            </div>
          ))}
          <hr className="my-1.5" style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)" }} />
          <div className="text-[10px] mb-1.5" style={{ color: "rgba(232,232,232,0.6)" }}>{beat.telegram.question}</div>
          <div className="flex flex-col gap-0.5">
            {beat.telegram.buttons.map((btn, i) => (
              <div
                key={i}
                className="text-[10px] text-center px-2 py-1 rounded"
                style={
                  btn.approve
                    ? { background: "rgba(76,175,125,0.15)", border: "1px solid rgba(76,175,125,0.25)", color: "#4caf7d" }
                    : { background: "rgba(45,157,214,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#2d9dd6" }
                }
              >
                {btn.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScheduledOrgDemo({ config }: { config: ScheduledOrgConfig }) {
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [revealedBeats, setRevealedBeats] = useState(0);
  const [lineCounts, setLineCounts] = useState([0, 0, 0, 0]);
  const [footerVisible, setFooterVisible] = useState(false);
  const [timerValue, setTimerValue] = useState(config.timerStart);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    timersRef.current.push(setTimeout(fn, delay));
  }, []);

  const run = useCallback(() => {
    if (playing) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (tickRef.current) clearInterval(tickRef.current);

    setPlaying(true);
    setDone(false);
    setRevealedBeats(0);
    setLineCounts([0, 0, 0, 0]);
    setFooterVisible(false);
    setTimerValue(config.timerStart);

    let t = 150;
    config.beats.forEach((beat, bi) => {
      schedule(() => setRevealedBeats(bi + 1), t);

      const items = beat.kind === "issues" ? beat.issues! : beat.kind === "worklines" ? beat.workLines! : [];
      items.forEach((_, li) => {
        schedule(() => {
          setLineCounts((prev) => {
            const next = [...prev];
            next[bi] = li + 1;
            return next;
          });
        }, t + 220 * (li + 1));
      });

      t += 600 + items.length * 120;
    });

    schedule(() => {
      setFooterVisible(true);
      setPlaying(false);
      setDone(true);

      if (config.ticking) {
        const start = parseMmSs(config.timerStart);
        if (start !== null) {
          let secs = start;
          tickRef.current = setInterval(() => {
            secs = Math.max(0, secs - 1);
            setTimerValue(formatMmSs(secs));
            if (secs === 0 && tickRef.current) clearInterval(tickRef.current);
          }, 80);
        }
      }
    }, t + 300);
  }, [config, playing, schedule]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (tickRef.current) clearInterval(tickRef.current);
    setPlaying(false);
    setDone(false);
    setRevealedBeats(0);
    setLineCounts([0, 0, 0, 0]);
    setFooterVisible(false);
    setTimerValue(config.timerStart);
  }, [config.timerStart]);

  return (
    <div className="flex flex-col gap-4 w-full rounded-2xl bg-espresso-deep/90 border border-gold/20 p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-label text-gold uppercase font-semibold">{config.eyebrow}</p>
        <span className="text-[10px] font-mono text-ivory/30 lowercase">simulated</span>
      </div>

      <p className="text-[11px] font-mono text-ivory/55 leading-snug">{config.description}</p>

      <div
        className="rounded-lg border border-gold/15 bg-black/40 px-3.5 py-2.5 font-mono text-[11px] leading-relaxed flex flex-col gap-1"
        style={{ color: "rgba(250,247,240,0.8)" }}
      >
        {config.createCmd.map((line, i) => (
          <div key={i} className={i === 0 ? "" : "pl-4"} style={{ color: i === 0 ? undefined : "rgba(250,247,240,0.55)" }}>
            {i === 0 && <span style={{ color: GOLD }} className="mr-1.5">$</span>}
            {line}
          </div>
        ))}
        <div>
          <span style={{ color: GOLD }} className="mr-1.5">$</span>
          {config.runCmd}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {config.beats.map((beat, i) => (
          <BeatCard key={i} beat={beat} on={i < revealedBeats} linesRevealed={lineCounts[i]} />
        ))}
      </div>

      <div
        className="flex items-center justify-between flex-wrap gap-3 pt-3 transition-opacity duration-500"
        style={{ borderTop: "1px solid rgba(200,169,126,0.1)", opacity: footerVisible ? 1 : 0 }}
      >
        <div>
          <div className="font-mono text-[10px]" style={{ color: "rgba(200,169,126,0.4)" }}>{config.timerLabel}</div>
          <div className="font-mono text-xl font-bold" style={{ color: GOLD, letterSpacing: "0.04em" }}>{timerValue}</div>
        </div>
        <div className="font-mono text-[10px]" style={{ color: "rgba(190,220,190,0.6)" }}>{config.statusLine}</div>
      </div>

      <div className="flex items-center gap-3">
        {!done && (
          <button
            onClick={run}
            disabled={playing}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 hover:bg-gold-warm"
            style={{ background: GOLD, color: ESPRESSO }}
          >
            {playing ? "Running…" : "Run →"}
          </button>
        )}
        {done && (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gold/15"
            style={{ background: "transparent", color: GOLD, border: `1px solid ${GOLD}60` }}
          >
            ↺ Run again
          </button>
        )}
        <span className="text-xs font-mono text-gold/70">
          {!playing && !done && "● idle"}
          {playing && "◌ running"}
          {done && "✓ complete"}
        </span>
      </div>
    </div>
  );
}
