"use client";

import { useEffect, useState } from "react";
import { capabilityCatalog } from "@/lib/workforce";
import { RevealHeading } from "./RevealHeading";

const FEATURED_DEPARTMENTS = [
  "Finance & Accounting",
  "Sales & CRM",
  "Customer Service & Helpdesk",
  "HR / Human Capital Management",
  "Marketing",
  "Procurement & Purchasing",
];

function AgentPills({ agents }: { agents: string[] }) {
  // Keyed by the caller on the active department, so a tab switch remounts
  // this component fresh (shown starts false again) instead of needing to
  // reset state synchronously inside an effect.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-wrap gap-2.5" role="tabpanel">
      {agents.map((agent, i) => (
        <span
          key={agent}
          className="rounded-full border border-espresso/15 bg-white px-3 py-1.5 text-xs text-espresso/70 transition-all duration-300 ease-out"
          style={{
            transitionDelay: `${i * 25}ms`,
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(6px)",
          }}
        >
          {agent}
        </span>
      ))}
    </div>
  );
}

export function HomeUseCases() {
  const departments = capabilityCatalog.filter((d) => FEATURED_DEPARTMENTS.includes(d.department));
  const [active, setActive] = useState(0);
  const current = departments[active];

  return (
    <section className="bg-ivory px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold-dark">What Workforce builds</p>
        <RevealHeading
          as="h2"
          className="mb-3 max-w-xl text-3xl font-light leading-tight tracking-tight text-espresso md:text-4xl"
        >
          23 departments. Real agent catalogs, not a mockup.
        </RevealHeading>
        <p className="mb-10 max-w-xl text-sm text-espresso/55">
          This is the Workforce service&apos;s capability catalog — digital workers Monoes builds
          and runs for your business on Monomind&apos;s orchestration engine. Pick a department to
          see a sample.
        </p>
        <div className="mb-8 flex flex-wrap gap-2" role="tablist">
          {departments.map((d, i) => (
            <button
              key={d.department}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className="rounded-full px-4 py-2 text-xs font-medium transition-all"
              style={{
                background: i === active ? "#8B6914" : "transparent",
                color: i === active ? "#FFFFF0" : "rgba(42,35,24,0.65)",
                border: `1px solid ${i === active ? "#8B6914" : "rgba(42,35,24,0.18)"}`,
              }}
            >
              {d.department}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-espresso/10 bg-ivory-warm p-6">
          <AgentPills key={current.department} agents={current.agents} />
        </div>
      </div>
    </section>
  );
}
