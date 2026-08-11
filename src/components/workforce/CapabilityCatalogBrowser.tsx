"use client";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  capabilityCatalog,
  discoveryContactEmail,
} from "@/lib/workforce";

const expo = [0.16, 1, 0.3, 1] as const;
const totalAgents = capabilityCatalog.reduce((sum, d) => sum + d.agents.length, 0);

const quickPicks: { label: string; keywords: string[] }[] = [
  { label: "Accounts payable", keywords: ["AP", "Invoice", "Reconciliation", "Ledger", "Tax"] },
  { label: "Onboarding", keywords: ["Onboarding", "Employee", "Resume", "Leave", "Payroll"] },
  { label: "Reconciliations", keywords: ["Reconciliation", "Bank", "Audit"] },
];

function shortlistHref(shortlist: string[]) {
  const subject = `Workforce Discovery — interested in ${shortlist.length} worker${shortlist.length === 1 ? "" : "s"}`;
  const body = `I'd like to explore automating these processes:\n\n${shortlist.map((s) => `• ${s}`).join("\n")}\n\n- Company name:\n- Team size:\n- Systems you run (ERP / CRM / email):\n- Preferred Discovery package (1-Day $3,000 / 5-Day $12,000):\n`;
  return `mailto:${discoveryContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function CapabilityCatalogBrowser() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [shortlist, setShortlist] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return capabilityCatalog;
    return capabilityCatalog
      .map((dept) => ({
        ...dept,
        agents: dept.department.toLowerCase().includes(q)
          ? dept.agents
          : dept.agents.filter((a) => a.toLowerCase().includes(q)),
      }))
      .filter((dept) => dept.agents.length > 0);
  }, [query]);

  const visibleCount = filtered.reduce((sum, d) => sum + d.agents.length, 0);

  function toggleAgent(agent: string) {
    setShortlist((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]
    );
  }

  function applyQuickPick(keywords: string[]) {
    const matches = capabilityCatalog.flatMap((d) =>
      d.agents.filter((a) => keywords.some((k) => a.toLowerCase().includes(k.toLowerCase())))
    );
    const merged = Array.from(new Set([...shortlist, ...matches]));
    setShortlist(merged);
  }

  function clearShortlist() {
    setShortlist([]);
  }

  return (
    <section className="px-8 md:px-16 lg:px-24 py-16 md:py-20 bg-ivory-warm">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a process or department…"
              className="w-full rounded-full border border-espresso/15 bg-white px-5 py-3 text-sm text-espresso placeholder:text-espresso/35 outline-none transition-colors focus:border-gold-dark/50"
            />
          </div>
          <p className="font-mono text-xs text-espresso/35">
            {visibleCount} of {totalAgents} workers
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs text-espresso/40 mr-1">Quick-pick:</span>
          {quickPicks.map((pick) => (
            <button
              key={pick.label}
              onClick={() => applyQuickPick(pick.keywords)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-gold-dark/30 text-gold-dark bg-white transition-colors hover:bg-gold-dark hover:text-white"
            >
              + {pick.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-espresso/50 py-12 text-center">
            No match for &quot;{query}&quot;. Try a broader term, or{" "}
            <a href="#discovery" className="text-gold-dark underline underline-offset-2">
              ask us directly
            </a>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dept, i) => (
              <motion.div
                key={dept.department}
                initial={reduce ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.03, ease: expo }}
                className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft"
              >
                <h3 className="text-sm font-semibold text-espresso mb-4 leading-snug">
                  {dept.department}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {dept.agents.map((agent) => {
                    const selected = shortlist.includes(agent);
                    return (
                      <button
                        key={agent}
                        onClick={() => toggleAgent(agent)}
                        aria-pressed={selected}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                          selected
                            ? "border-gold-dark bg-gold-dark text-white"
                            : "border-gold-dark/25 text-gold-dark bg-gold-dark/5 hover:bg-gold-dark/15"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {agent}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {shortlist.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-espresso/10 bg-ivory/95 backdrop-blur-lg shadow-soft-lg">
          <div className="mx-auto max-w-6xl px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-espresso">
                {shortlist.length} worker{shortlist.length === 1 ? "" : "s"} shortlisted
              </span>
              <button
                onClick={clearShortlist}
                className="text-xs text-espresso/40 underline underline-offset-2 hover:text-espresso"
              >
                clear
              </button>
            </div>
            <a
              href={shortlistHref(shortlist)}
              className="rounded-full bg-gold-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-espresso"
            >
              Book a Discovery with these →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
