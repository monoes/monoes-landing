"use client";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { capabilityCatalog } from "@/lib/workforce";

const expo = [0.16, 1, 0.3, 1] as const;
const totalAgents = capabilityCatalog.reduce((sum, d) => sum + d.agents.length, 0);

export function CapabilityCatalogBrowser() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");

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

  return (
    <section className="px-8 md:px-16 lg:px-24 py-16 md:py-20 bg-ivory-warm">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                  {dept.agents.map((agent) => (
                    <span
                      key={agent}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-gold-dark/25 text-gold-dark bg-gold-dark/5"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
