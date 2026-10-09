"use client";

import { useState } from "react";
import { RevealHeading } from "./RevealHeading";

const COMPARE: { axis: string; monomind: string; monoAgent: string }[] = [
  { axis: "You already need", monomind: "Claude Code + Node/npm installed", monoAgent: "A Go toolchain to build it, plus your own OpenRouter / HuggingFace / Gemini key" },
  { axis: "You hand it", monomind: "An outcome, in plain language", monoAgent: "A workflow: triggers, nodes, a schedule" },
  { axis: "It starts on", monomind: "A goal you set, or a scheduled org", monoAgent: "A cron trigger, an event, or you clicking run" },
  { axis: "A typical task", monomind: '"Fix this bug and open a PR"', monoAgent: '"Pull new leads, enrich them, update the CRM, DM the rep"' },
  { axis: "The result lands in", monomind: "A diff in your repo, reviewed before merge", monoAgent: "Another system, a browser, a spreadsheet, a message" },
  { axis: "License", monomind: "Apache-2.0", monoAgent: "MIT" },
];

export function HomeCapabilities() {
  const [hovered, setHovered] = useState<"monomind" | "monoAgent" | null>(null);

  const dim = (side: "monomind" | "monoAgent") =>
    hovered !== null && hovered !== side ? "opacity-45" : "opacity-100";

  return (
    <section className="bg-espresso">
      <div className="mx-auto max-w-3xl px-6 pt-20 text-center md:pt-28">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Two engines</p>
        <RevealHeading
          as="h2"
          className="mb-5 text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl"
        >
          Not either/or. Pick by what starts the work.
        </RevealHeading>
        <p className="mb-14 text-sm leading-relaxed text-ivory/55">
          They don&apos;t compete for the same task, so there&apos;s no wrong pick between them —
          only a wrong pick if you ask one to do the other&apos;s job. If the work ends in a pull
          request, it&apos;s Monomind&apos;s. If it ends anywhere else, it&apos;s Mono Agent&apos;s.
        </p>
      </div>

      <div className="grid md:grid-cols-2">
        <div
          onMouseEnter={() => setHovered("monomind")}
          onMouseLeave={() => setHovered(null)}
          className={`border-t border-gold/15 px-6 py-10 transition-opacity duration-300 md:px-10 lg:px-16 ${dim("monomind")}`}
          style={{ background: "#1c1309" }}
        >
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-[#8B6914]">Monomind</p>
          <p className="mb-8 text-sm text-ivory/45">Hire an AI team. Set a goal. Walk away.</p>
          <dl className="flex flex-col gap-6">
            {COMPARE.map((row) => (
              <div key={row.axis}>
                <dt className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ivory/35">
                  {row.axis}
                </dt>
                <dd className="text-sm leading-relaxed text-ivory/80">{row.monomind}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          onMouseEnter={() => setHovered("monoAgent")}
          onMouseLeave={() => setHovered(null)}
          className={`border-t border-gold/15 px-6 py-10 transition-opacity duration-300 md:px-10 lg:px-16 ${dim("monoAgent")}`}
          style={{ background: "#241a0d" }}
        >
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-[#C8A97E]">Mono Agent</p>
          <p className="mb-8 text-sm text-ivory/45">n8n meets Playwright. Self-hosted.</p>
          <dl className="flex flex-col gap-6">
            {COMPARE.map((row) => (
              <div key={row.axis}>
                <dt className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ivory/35">
                  {row.axis}
                </dt>
                <dd className="text-sm leading-relaxed text-ivory/80">{row.monoAgent}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className="mx-auto max-w-2xl px-6 py-14 text-center text-sm leading-relaxed text-ivory/45">
        Most people who install one eventually install both. They don&apos;t talk to each other
        yet — we&apos;re not claiming a bridge that doesn&apos;t exist.
      </p>
    </section>
  );
}
