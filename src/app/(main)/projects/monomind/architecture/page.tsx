import type { Metadata } from "next";
import Link from "next/link";
import { FactCards, FactList, Rich, SectionHead } from "@/components/projects/ArchitectureBits";
import {
  ARCH_DATE,
  ARCH_VERSION,
  components,
  honestNotes,
  hookGroups,
  memoryFacts,
  meta,
  orgFacts,
  platforms,
  routingSteps,
  runtimeCaveats,
  runtimeFacts,
  securityFacts,
  stats,
} from "@/content/monomind-architecture";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/projects/monomind/architecture" },
  openGraph: { title: meta.ogTitle, description: meta.ogDescription },
};

const accent = "#8B6914";

const sectionNav = ["Overview", "Packages", "Memory", "Routing", "Hooks", "Runtimes", "Org Runtime", "Security", "Notes"];

export default function MonomindArchitecturePage() {
  return (
    <div className="bg-ivory-warm min-h-screen pt-24">
      <div className="border-b border-ivory-linen bg-white/80 backdrop-blur-sm sticky top-[80px] z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Link
              href="/projects/monomind"
              className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors"
            >
              ← Monomind
            </Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">Architecture</span>
          </div>
          <nav className="hidden xl:flex items-center gap-4">
            {sectionNav.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs whitespace-nowrap uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <section className="px-8 py-24 md:py-28 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <div
            className="inline-block mb-6 text-xs font-semibold uppercase tracking-label px-3 py-1 rounded-full border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
          >
            v{ARCH_VERSION} · Technical Architecture
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>Monomind</span>
            <br />
            Is Actually Built
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            A 9-package monorepo that adds a code knowledge graph, persistent memory, a picker and standing agent
            teams to the AI coding tools you already use. Every number below was checked against the v{ARCH_VERSION}{" "}
            source and its generated doc counts, not carried over from an old design.
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

      <section id="overview" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Architecture"
            title="System Overview"
            intro="Your coding tool talks to the CLI package over MCP, a hand-rolled stdio JSON-RPC loop. The CLI loads the other packages as it needs them. Most are libraries, not always-running services."
          />
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg
              viewBox="0 0 900 460"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              style={{ fontFamily: "Satoshi, -apple-system, sans-serif" }}
              role="img"
              aria-label="Diagram: coding tools talk over MCP to the Monomind CLI, which loads hooks, memory, monograph and monofence-ai"
            >
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="rgba(42,35,24,0.3)" />
                </marker>
                <marker id="arrow-gold" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#8B6914" />
                </marker>
              </defs>
              <rect x="50" y="20" width="800" height="60" rx="10" fill="rgba(139,105,20,0.06)" stroke="#8B6914" strokeWidth="1.5" strokeOpacity="0.5" />
              <text x="450" y="45" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">CLAUDE CODE · OPENCODE · ANTIGRAVITY · KIMI CODE · CODEX</text>
              <text x="450" y="65" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="11">MCP over stdio JSON-RPC ↔ @monoes/monomindcli (packages/@monomind/cli/)</text>
              <line x1="450" y1="80" x2="450" y2="115" stroke="#8B6914" strokeWidth="1.5" markerEnd="url(#arrow-gold)" strokeOpacity="0.7" />
              <rect x="290" y="120" width="320" height="55" rx="12" fill="rgba(139,105,20,0.08)" stroke="#8B6914" strokeWidth="2" />
              <text x="450" y="145" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">@monoes/monomindcli</text>
              <text x="450" y="163" textAnchor="middle" fill="#8B6914" fontSize="10" fontWeight="600">38 commands · org runtime · loads the packages below</text>
              <path d="M 360 175 L 130 210" stroke="rgba(139,115,85,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 420 175 L 330 210" stroke="rgba(184,149,106,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 480 175 L 570 210" stroke="rgba(160,120,64,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 540 175 L 770 210" stroke="rgba(200,169,126,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <rect x="40" y="215" width="180" height="60" rx="10" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.5" />
              <text x="130" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/hooks</text>
              <text x="130" y="256" textAnchor="middle" fill="#8B7355" fontSize="9" fontWeight="600">Registry + 9 workers</text>
              <rect x="240" y="215" width="180" height="60" rx="10" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.5" />
              <text x="330" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/memory</text>
              <text x="330" y="256" textAnchor="middle" fill="#B8956A" fontSize="9" fontWeight="600">SQLite + local embeddings</text>
              <rect x="440" y="215" width="180" height="60" rx="10" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.5" />
              <text x="530" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/monograph</text>
              <text x="530" y="256" textAnchor="middle" fill="#A07840" fontSize="9" fontWeight="600">tree-sitter + SQLite graph</text>
              <rect x="640" y="215" width="180" height="60" rx="10" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.5" />
              <text x="730" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">monofence-ai</text>
              <text x="730" y="256" textAnchor="middle" fill="#C8A97E" fontSize="9" fontWeight="600">local manipulation scanner</text>
              <path d="M 130 275 L 130 320" stroke="rgba(139,115,85,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M 330 275 L 330 320" stroke="rgba(184,149,106,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M 530 275 L 530 320" stroke="rgba(160,120,64,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <rect x="40" y="325" width="180" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="130" y="346" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10" fontWeight="600">.monomind/metrics/</text>
              <text x="130" y="362" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">worker JSON outputs</text>
              <rect x="240" y="325" width="180" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="330" y="346" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10" fontWeight="600">memory.db (SQLite)</text>
              <text x="330" y="362" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">memories · Second Brain · memory graph</text>
              <rect x="440" y="325" width="180" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="530" y="346" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10" fontWeight="600">.monomind/monograph.db</text>
              <text x="530" y="362" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">nodes · edges · communities</text>
              <rect x="60" y="400" width="780" height="45" rx="10" fill="rgba(42,35,24,0.02)" stroke="rgba(42,35,24,0.06)" strokeWidth="1" />
              <text x="450" y="420" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="11" fontWeight="600">Also: @monoes/mcp (http/ws) · @monoes/routing (legacy) · @monoes/monobrowse (CDP) · @monoes/monodesign</text>
              <text x="450" y="436" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">org roles run on up to 19 agent runners, from Claude in-process to subprocess CLIs</text>
            </svg>
          </div>
        </div>
      </section>

      <section id="packages" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Modules"
            title="9 Packages"
            intro="Six live under packages/@monomind/ (cli, hooks, mcp, memory, monograph, routing) and publish under the @monoes/ npm scope. Two live under packages/@monoes/ (monobrowse, monodesign), and monofence-ai is unscoped. Users install the `monomind` umbrella."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {components.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft hover:shadow-soft-lg hover:border-espresso/20 transition-all duration-200"
                style={{ borderTop: `3px solid ${c.color}` }}
              >
                <div className="text-2xl mb-3">{c.icon}</div>
                <p className="text-[10px] uppercase tracking-label font-semibold mb-1" style={{ color: c.color }}>
                  {c.subtitle}
                </p>
                <h3 className="text-sm font-semibold text-espresso mb-1 font-mono">{c.name}</h3>
                <p className="text-[10px] text-espresso/40 font-mono mb-2">{c.path}</p>
                <p className="text-xs text-espresso/60 leading-relaxed mb-4">
                  <Rich text={c.description} />
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                      style={{ color: c.color, borderColor: `${c.color}40`, background: `${c.color}08` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="memory" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Memory"
            title="Local SQLite, Not a Vector Cloud Service"
            intro="Several mechanisms share the word memory in this codebase. Here is what each one actually is, and where the Second Brain fits."
          />
          <FactList facts={memoryFacts} />
        </div>
      </section>

      <section id="routing" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Picking"
            title="Pick First, Route Only If Needed"
            intro="Choosing the right specialist is a ranking problem, not a model call. The picker does it locally, and the older semantic router is deprecated."
          />
          <div className="flex flex-col gap-3">
            {routingSteps.map((step, i) => (
              <div key={step.num}>
                <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft flex gap-5 items-start hover:border-espresso/20 transition-colors">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: step.color }}
                  >
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-espresso mb-1">
                      <Rich text={step.title} />
                    </h5>
                    <p className="text-xs text-espresso/55 leading-relaxed">
                      <Rich text={step.body} />
                    </p>
                  </div>
                </div>
                {i < routingSteps.length - 1 && <div className="text-center text-espresso/25 text-lg py-1">↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="hooks" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Hook System"
            title="Two Different Things Called “Hooks”"
            intro="28 CLI subcommands and 20 typed registry events are different mechanisms that share a name, with 9 on-demand workers underneath both."
          />
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {hookGroups.map((g) => (
              <div key={g.title} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
                <h4 className="text-sm font-semibold text-espresso mb-3">
                  <Rich text={g.title} />
                </h4>
                <ul className="flex flex-col gap-2">
                  {g.items.map((item) => (
                    <li key={item} className="text-xs text-espresso/60 leading-relaxed">
                      <Rich text={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="runtimes" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Runtimes"
            title="Five Tools In, Nineteen Runners Out"
            intro="Monomind plugs into the coding tool you already use, and its org roles can run on a different set of agent runtimes through one protocol."
          />
          <FactCards items={runtimeFacts} accent={accent} />
          <div className="mt-8 rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-espresso/10 text-[10px] uppercase tracking-label font-bold" style={{ color: accent }}>
              What `monomind init` writes for each tool
            </div>
            <dl>
              {platforms.map((p) => (
                <div key={p.name} className="grid gap-1 md:grid-cols-[200px_1fr] px-6 py-4 border-b last:border-b-0 border-espresso/5">
                  <dt className="text-sm font-semibold text-espresso">{p.name}</dt>
                  <dd className="text-xs text-espresso/60 font-mono leading-relaxed">{p.writes}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ul className="mt-6 flex flex-col gap-2">
            {runtimeCaveats.map((c) => (
              <li key={c} className="text-xs text-espresso/55 leading-relaxed flex gap-3">
                <span style={{ color: accent }}>-</span>
                <span>
                  <Rich text={c} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="org-runtime" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Org Runtime"
            title="SDK-Backed Agent Orgs"
            intro="`monomind org run` replaced the old prompt-orchestrated path. Each role is a live agent session with a budget, a policy and an approval path, not a scripted prompt loop."
          />
          <FactCards items={orgFacts} accent={accent} />
        </div>
      </section>

      <section id="security" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Security and Trust"
            title="What Is Protected, and What Is Not"
            intro="Monomind keeps its own state on your machine, but the AI tools it drives talk to their model providers. These are the guarantees as the docs state them, limits included."
          />
          <FactList facts={securityFacts} />
        </div>
      </section>

      <section id="notes" className="px-8 py-20 bg-ivory-parchment scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accent}
            eyebrow="Honesty Notes"
            title="What We Won’t Overclaim"
            intro="A short list of things that are easy to overstate. We would rather say them plainly here than have you find out later."
          />
          <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <ul className="flex flex-col gap-4">
              {honestNotes.map((note) => (
                <li key={note} className="text-sm text-espresso/65 leading-relaxed flex gap-3">
                  <span style={{ color: accent }}>-</span>
                  <span>
                    <Rich text={note} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          Monomind v{ARCH_VERSION} · Architecture · {ARCH_DATE} ·{" "}
          <Link href="/projects/monomind" className="hover:text-espresso/60 transition-colors">
            ← Back to Monomind
          </Link>
        </p>
      </footer>
    </div>
  );
}
