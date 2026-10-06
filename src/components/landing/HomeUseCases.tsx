"use client";

import { useState } from "react";
import { capabilityCatalog } from "@/lib/workforce";

const FEATURED_DEPARTMENTS = [
  "Finance & Accounting",
  "Sales & CRM",
  "Customer Service & Helpdesk",
  "HR / Human Capital Management",
  "Marketing",
  "Procurement & Purchasing",
];

export function HomeUseCases() {
  const departments = capabilityCatalog.filter((d) => FEATURED_DEPARTMENTS.includes(d.department));
  const [active, setActive] = useState(0);
  const current = departments[active];

  return (
    <section className="bg-espresso px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">What Workforce builds</p>
        <h2 className="mb-3 max-w-xl text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl">
          23 departments. Real agent catalogs, not a mockup.
        </h2>
        <p className="mb-10 max-w-xl text-sm text-ivory/50">
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
                background: i === active ? "#C8A97E" : "rgba(200,169,126,0.08)",
                color: i === active ? "#2A2318" : "rgba(250,247,240,0.7)",
                border: `1px solid ${i === active ? "#C8A97E" : "rgba(200,169,126,0.25)"}`,
              }}
            >
              {d.department}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5 rounded-xl border border-gold/15 bg-espresso-deep/60 p-6" role="tabpanel">
          {current.agents.map((agent) => (
            <span
              key={agent}
              className="rounded-full border border-gold/20 bg-black/20 px-3 py-1.5 text-xs text-ivory/70"
            >
              {agent}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
