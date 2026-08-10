import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityCatalogBrowser } from "@/components/workforce/CapabilityCatalogBrowser";
import { capabilityCatalog } from "@/lib/workforce";

const accent = "#8B6914";
const totalAgents = capabilityCatalog.reduce((sum, d) => sum + d.agents.length, 0);

export const metadata: Metadata = {
  title: "Capability Catalog: Monoes Workforce",
  description: `${capabilityCatalog.length} departments, ${totalAgents} AI digital workers. Browse every process Monoes Workforce can automate.`,
};

export default function CapabilitiesPage() {
  return (
    <div className="bg-ivory-warm min-h-screen">
      {/* Header */}
      <div className="mt-[68px] border-b border-ivory-linen bg-white/60 backdrop-blur-sm sticky top-[68px] z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/workforce"
              className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors"
            >
              ← Workforce
            </Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">
              Capability Catalog
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="px-8 py-20 md:py-28 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <div
            className="inline-block mb-6 text-xs font-semibold uppercase tracking-label px-3 py-1 rounded-full border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
          >
            {capabilityCatalog.length} departments · {totalAgents} workers
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-espresso tracking-tight leading-none mb-6 text-balance">
            If it&apos;s a repeatable process,
            <br />
            there&apos;s probably <span style={{ color: accent }}>a worker for it.</span>
          </h1>
          <p className="text-lg text-espresso/55 font-light leading-relaxed max-w-2xl">
            This is the working catalog we configure from, not a fixed product
            list. If your process isn&apos;t here, that&apos;s a Discovery
            conversation, not a dead end.
          </p>
        </div>
      </section>

      <CapabilityCatalogBrowser />

      {/* Footer */}
      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          Monoes Workforce · Capability Catalog ·{" "}
          <Link href="/workforce" className="hover:text-espresso/60 transition-colors">
            ← Back to Workforce
          </Link>
        </p>
      </footer>
    </div>
  );
}
