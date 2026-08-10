import type { Metadata } from "next";
import Link from "next/link";
import {
  architectureLayers,
  humanInLoopLevels,
  processDefinitionExample,
  evaluationMetricsExample,
  connectors,
} from "@/lib/workforce";

const accent = "#8B6914";

const navItems = ["Architecture", "Human-in-the-Loop", "Process Model", "Evaluation", "Connectors"];

const stats = [
  { value: "4", label: "Architecture Layers" },
  { value: "5", label: "Human-in-the-Loop Levels" },
  { value: "6", label: "Starting Connectors" },
];

export const metadata: Metadata = {
  title: "How Monoes Workforce Works: Architecture",
  description:
    "The Workflow / Agent / Policy / Connector model behind Monoes Workforce, human-in-the-loop levels, the process definition format, and how agent performance is evaluated.",
};

export default function WorkforceHowItWorksPage() {
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
              How It Works
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="px-8 py-24 md:py-32 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <div
            className="inline-block mb-6 text-xs font-semibold uppercase tracking-label px-3 py-1 rounded-full border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
          >
            Monoes Workforce · Technical Model
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6 text-balance">
            The LLM isn&apos;t the brain
            <br />
            of the <span style={{ color: accent }}>whole system.</span>
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            It&apos;s one component of the execution layer. Splitting Workflow,
            Agent, Policy, and Connector apart is what lets us swap models,
            processes, or ERPs without breaking anything downstream.
          </p>
          <div className="inline-flex flex-wrap gap-px overflow-hidden rounded-xl border border-espresso/10 bg-espresso/5">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-start gap-1 px-6 py-4 bg-white/80">
                <span className="text-2xl font-semibold leading-none tracking-tight" style={{ color: accent }}>
                  {value}
                </span>
                <span className="text-[10px] uppercase tracking-label font-medium text-espresso/45">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>
            Architecture
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">
            Four Layers, Each With One Job
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Keeping these separate is deliberate. A reasoning model should
            never be the thing deciding what&apos;s allowed.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {architectureLayers.map((layer) => (
              <div
                key={layer.name}
                className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft"
                style={{ borderTop: `3px solid ${accent}` }}
              >
                <h3 className="text-base font-semibold text-espresso mb-1">{layer.name}</h3>
                <p className="text-[10px] uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>
                  {layer.role}
                </p>
                <p className="text-xs text-espresso/60 leading-relaxed">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Human-in-the-Loop */}
      <section id="human-in-the-loop" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>
            Human-in-the-Loop
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">
            The Goal Isn&apos;t to Remove Humans
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            It&apos;s to let people spend their time on judgment, not data
            entry. Every engagement starts at Level 2 and earns its way up as
            trust builds.
          </p>
          <div className="flex flex-col gap-3">
            {humanInLoopLevels.map((lvl, i) => (
              <div key={lvl.level}>
                <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft flex gap-5 items-start hover:border-espresso/20 transition-colors">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: accent }}
                  >
                    {lvl.level}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-espresso mb-1">{lvl.name}</h5>
                    <p className="text-xs text-espresso/55 leading-relaxed">{lvl.description}</p>
                  </div>
                </div>
                {i < humanInLoopLevels.length - 1 && (
                  <div className="text-center text-espresso/25 text-lg py-1">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Model */}
      <section id="process-model" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>
            Process Model
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">
            Every Process Is a Structured Model
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Not a prompt, not a flowchart drawing: a versioned definition the
            Workflow layer actually executes. Example for invoice processing:
          </p>
          <pre className="bg-espresso text-gold text-xs md:text-sm font-mono rounded-2xl p-6 md:p-8 overflow-x-auto leading-relaxed whitespace-pre shadow-soft-lg">
            {processDefinitionExample}
          </pre>
        </div>
      </section>

      {/* Evaluation */}
      <section id="evaluation" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>
            Evaluation
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">
            Every Worker Is Held to a Scorecard
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Historical cases become the evaluation dataset for every new
            agent version, before it&apos;s promoted to run live. Illustrative
            example for an Accounts Payable worker:
          </p>
          <pre className="bg-espresso text-gold text-xs md:text-sm font-mono rounded-2xl p-6 md:p-8 overflow-x-auto leading-relaxed whitespace-pre shadow-soft-lg max-w-md">
            {evaluationMetricsExample}
          </pre>
        </div>
      </section>

      {/* Connectors */}
      <section id="connectors" className="px-8 py-20 bg-ivory-parchment">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>
            Connectors
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">
            We Connect to What You Already Run
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-10">
            No rip-and-replace. The Connector layer is a standard bridge to
            your existing systems. New ones get added as customers need
            them.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {connectors.map((c) => (
              <span
                key={c}
                className="text-xs font-medium px-3.5 py-2 rounded-full border"
                style={{ color: accent, borderColor: `${accent}40`, background: `${accent}08` }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          Monoes Workforce · How It Works ·{" "}
          <Link href="/workforce" className="hover:text-espresso/60 transition-colors">
            ← Back to Workforce
          </Link>
        </p>
      </footer>
    </div>
  );
}
