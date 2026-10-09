import type { Metadata } from "next";
import Link from "next/link";
import { FactCards, FactList, Rich, SectionHead } from "@/components/projects/ArchitectureBits";
import {
  ARCH_DATE,
  ARCH_VERSION,
  aiFacts,
  benchmarkNote,
  benchmarks,
  browserFacts,
  executionFlow,
  heroStats,
  meta,
  modules,
  nodeGroups,
  securityFacts,
  surfaceFacts,
} from "@/content/mono-agent-architecture";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/projects/mono-agent/architecture" },
  openGraph: { title: meta.ogTitle, description: meta.ogDescription },
};

const accent = "#C8A97E";
const accentText = "#8B6914";

const sectionNav = ["Overview", "Modules", "Execution", "Nodes", "Browser", "AI", "Surface", "Security", "Benchmarks"];

export default function MonoAgentArchitecturePage() {
  return (
    <div className="bg-ivory-warm min-h-screen pt-24">
      <div className="border-b border-ivory-linen bg-white/80 backdrop-blur-sm sticky top-[80px] z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Link
              href="/projects/mono-agent"
              className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors"
            >
              ← Mono Agent
            </Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">Architecture</span>
          </div>
          <nav className="hidden xl:flex items-center gap-4">
            {sectionNav.map((s) => (
              <a
                key={s}
                href={`#${s.toLowerCase()}`}
                className="text-xs whitespace-nowrap uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors"
              >
                {s}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <section className="px-8 py-24 md:py-28 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <div
            className="inline-block mb-6 text-xs font-semibold uppercase tracking-label px-3 py-1 rounded-full border"
            style={{ color: accentText, borderColor: `${accent}60`, background: `${accent}18` }}
          >
            v{ARCH_VERSION} · Go · One static binary
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accentText }}>Mono Agent</span>
            <br />
            Is Actually Built
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            A local-first workflow engine in a single Go binary: 168 node types, your own Chrome as the browser,
            AI that runs on the agent CLIs you already have, and a durable human-approval queue. Every number below was
            measured against the v{ARCH_VERSION} source and the installed binary.
          </p>
          <div className="inline-flex flex-wrap gap-px overflow-hidden rounded-xl border border-espresso/10 bg-espresso/5">
            {heroStats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-start gap-1 px-6 py-4 bg-white/80">
                <span className="text-2xl font-semibold leading-none tracking-tight" style={{ color: accentText }}>
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
            accent={accentText}
            eyebrow="Architecture"
            title="System Overview"
            intro="The workflow engine is the centre. Triggers feed its queue, it dispatches to the node registry, and browser steps go out through the extension bridge to your own Chrome. AI steps are handed to agent CLIs through monomind."
          />
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg
              viewBox="0 0 900 440"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              style={{ fontFamily: "Satoshi, -apple-system, sans-serif" }}
              role="img"
              aria-label="Diagram: triggers feed the workflow engine, which dispatches to node groups backed by SQLite storage, your own Chrome and agent CLIs"
            >
              <defs>
                <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="rgba(42,35,24,0.25)" />
                </marker>
                <marker id="arr3-acc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#C8A97E" />
                </marker>
              </defs>
              <rect x="30" y="18" width="100" height="44" rx="8" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1.3" />
              <text x="80" y="36" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Manual</text>
              <text x="80" y="52" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">CLI · UI · MCP · API</text>
              <rect x="145" y="18" width="100" height="44" rx="8" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1.3" />
              <text x="195" y="36" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Cron</text>
              <text x="195" y="52" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">daemon</text>
              <rect x="260" y="18" width="100" height="44" rx="8" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1.3" />
              <text x="310" y="36" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Webhook</text>
              <text x="310" y="52" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">127.0.0.1:9321</text>
              <rect x="110" y="95" width="270" height="65" rx="12" fill="rgba(200,169,126,0.12)" stroke="#C8A97E" strokeWidth="2" />
              <text x="245" y="120" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">Workflow engine</text>
              <text x="245" y="138" textAnchor="middle" fill="#8B6914" fontSize="10" fontWeight="600">DAG · queue 1,000 · 3 workers (max 20)</text>
              <text x="245" y="152" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">topological order · resume state · HIL pause</text>
              <rect x="420" y="95" width="200" height="65" rx="10" fill="rgba(184,149,106,0.1)" stroke="#B8956A" strokeWidth="1.5" />
              <text x="520" y="118" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">Action executor</text>
              <text x="520" y="135" textAnchor="middle" fill="#8B6914" fontSize="10">~38 step types</text>
              <text x="520" y="150" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">library packages from monoes.me</text>
              <rect x="640" y="95" width="220" height="65" rx="10" fill="rgba(160,120,64,0.1)" stroke="#A07840" strokeWidth="1.5" />
              <text x="750" y="118" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">Expression engine</text>
              <text x="750" y="135" textAnchor="middle" fill="#8B6914" fontSize="10">text/template · FuncMap</text>
              <text x="750" y="150" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">{`{{$json.*}} · {{$node["…"].json.*}}`}</text>
              <rect x="30" y="198" width="130" height="58" rx="9" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2" />
              <text x="95" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Browser</text>
              <text x="95" y="238" textAnchor="middle" fill="#8B7355" fontSize="9">extension bridge</text>
              <text x="95" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">your own Chrome</text>
              <rect x="173" y="198" width="130" height="58" rx="9" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.2" />
              <text x="238" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Social</text>
              <text x="238" y="238" textAnchor="middle" fill="#8B6914" fontSize="9">60 nodes</text>
              <text x="238" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">IG · LI · X · TikTok · HN · PH</text>
              <rect x="316" y="198" width="130" height="58" rx="9" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.2" />
              <text x="381" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">AI</text>
              <text x="381" y="238" textAnchor="middle" fill="#8B6914" fontSize="9">agent.ask</text>
              <text x="381" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">via monomind runner</text>
              <rect x="459" y="198" width="130" height="58" rx="9" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.2" />
              <text x="524" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Services</text>
              <text x="524" y="238" textAnchor="middle" fill="#8B6914" fontSize="9">36 nodes</text>
              <text x="524" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">GitHub · Gmail · Slack · …</text>
              <rect x="602" y="198" width="130" height="58" rx="9" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2" />
              <text x="667" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Core</text>
              <text x="667" y="238" textAnchor="middle" fill="#8B7355" fontSize="9">if · switch · merge</text>
              <text x="667" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">filter · code · limit</text>
              <rect x="745" y="198" width="120" height="58" rx="9" fill="rgba(200,169,126,0.06)" stroke="#C8A97E" strokeWidth="1.1" strokeDasharray="3,2" />
              <text x="805" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">HIL queue</text>
              <text x="805" y="238" textAnchor="middle" fill="#8B6914" fontSize="9">durable pause</text>
              <text x="805" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">approve · edit · reject</text>
              <rect x="30" y="295" width="835" height="50" rx="10" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1.2" />
              <text x="447" y="315" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="11" fontWeight="700">Storage (modernc.org/sqlite · pure Go · no CGO) · ~/.monoagent/monoagent.db</text>
              <text x="447" y="333" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9.5">workflows · executions · people · tasks · publications · messages · secrets (AES-256-GCM, OS keyring)</text>
              {[80, 195, 310].map((x) => (
                <line key={x} x1={x} y1="62" x2={245} y2="95" stroke="#C8A97E" strokeWidth="1.2" markerEnd="url(#arr3-acc)" strokeOpacity="0.5" />
              ))}
              <line x1="380" y1="140" x2="420" y2="140" stroke="#B8956A" strokeWidth="1.2" markerEnd="url(#arr3)" strokeOpacity="0.5" />
              <path d="M 380 112 L 400 84 L 630 84 L 650 100" fill="none" stroke="#A07840" strokeWidth="1.2" markerEnd="url(#arr3)" strokeOpacity="0.5" />
              {[95, 238, 381, 524, 667, 805].map((x) => (
                <line key={x} x1={x} y1="160" x2={x > 600 ? 700 : x} y2="198" stroke="rgba(42,35,24,0.15)" strokeWidth="1.1" markerEnd="url(#arr3)" strokeDasharray="4,3" />
              ))}
              {[95, 238, 381, 524, 667].map((x) => (
                <line key={x} x1={x} y1="256" x2={447} y2="295" stroke="rgba(42,35,24,0.1)" strokeWidth="1" markerEnd="url(#arr3)" strokeDasharray="3,4" />
              ))}
              <rect x="30" y="375" width="190" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="125" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">Your Chrome + MonoAgent Bridge</text>
              <text x="125" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">loopback WebSocket :9222 · shared secret</text>
              <rect x="240" y="375" width="150" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="315" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">External APIs</text>
              <text x="315" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">Slack · GitHub · Gmail · …</text>
              <rect x="410" y="375" width="210" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="515" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">Agent CLIs you have installed</text>
              <text x="515" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">claude · codex · agy · opencode · …</text>
              <line x1="95" y1="345" x2="110" y2="375" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr3)" />
              <line x1="524" y1="345" x2="320" y2="375" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr3)" />
              <line x1="381" y1="345" x2="500" y2="375" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr3)" />
              <circle r="2.5" fill="#C8A97E" opacity="0.9">
                <animateMotion dur="2.2s" repeatCount="indefinite" path="M 195 62 L 245 95" />
              </circle>
              <circle r="2.5" fill="#A07840" opacity="0.8">
                <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.5s" path="M 245 160 L 381 198" />
              </circle>
            </svg>
          </div>
        </div>
      </section>

      <section id="modules" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="Internal Packages"
            title="9 Building Blocks"
            intro="About 244,000 lines of Go in 1,197 files, plus roughly the same again in tests. `internal/` holds 88 top-level packages, so these cards group them by job."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft hover:shadow-soft-lg hover:border-espresso/20 transition-all duration-200"
                style={{ borderTop: `3px solid ${m.color}` }}
              >
                <div className="text-2xl mb-3">{m.icon}</div>
                <p className="text-[10px] uppercase tracking-label font-semibold mb-1" style={{ color: accentText }}>
                  {m.subtitle}
                </p>
                <h3 className="text-xs font-semibold text-espresso mb-2 font-mono">{m.name}</h3>
                <p className="text-xs text-espresso/60 leading-relaxed mb-4">
                  <Rich text={m.description} />
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                      style={{ color: accentText, borderColor: `${m.color}60`, background: `${m.color}12` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="execution" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="Execution"
            title="Workflow Execution Flow"
            intro="From trigger to result in 8 steps. Executions are sequential per run, durable across restarts, and pausable for a human."
          />
          <div className="flex flex-col gap-4">
            {executionFlow.map((step) => (
              <div key={step.num} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: step.color }}
                >
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-espresso mb-2">{step.title}</h4>
                  <p className="text-sm text-espresso/60 leading-relaxed mb-3">
                    <Rich text={step.body} />
                  </p>
                  {step.code && (
                    <pre className="text-xs bg-ivory-warm border border-espresso/10 rounded-lg px-4 py-3 text-espresso/70 font-mono leading-relaxed overflow-x-auto">
                      {step.code}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="nodes" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="Node Registry"
            title="168 Node Types"
            intro="Counted from `monoagentcli node list`, grouped here by job. A `-tags nosocial` build leaves out the social nodes and keeps 107."
          />
          <div className="flex flex-col gap-4">
            {nodeGroups.map((nt) => (
              <div key={nt.category} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft flex items-center gap-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-espresso flex-shrink-0"
                  style={{ background: `${nt.color}55` }}
                >
                  {nt.count}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-espresso mb-2">{nt.category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {nt.examples.map((e) => (
                      <span
                        key={e}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg border"
                        style={{ color: accentText, borderColor: `${nt.color}60`, background: `${nt.color}12` }}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="browser" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="Browser"
            title="Your Own Chrome, Not a Hidden One"
            intro="Mono Agent no longer launches its own browser. It works inside the Chrome you already use, through an extension you install."
          />
          <FactList facts={browserFacts} />
        </div>
      </section>

      <section id="ai" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="AI"
            title="AI Runs on the Agent CLIs You Already Have"
            intro="There is no model provider to configure. Mono Agent hands each AI step to your installed agent CLI through the monomind runner."
          />
          <FactList facts={aiFacts} />
        </div>
      </section>

      <section id="surface" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="Surface"
            title="What Runs Around the Engine"
            intro="The same engine answers to a CLI, a desktop app, an MCP server and an HTTP API, all running on your machine, alongside a daemon, a task board and a library."
          />
          <FactCards items={surfaceFacts} accent={accentText} />
        </div>
      </section>

      <section id="security" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="Security and Privacy"
            title="Local by Default, With the Limits Stated"
            intro="All data lives under ~/.monoagent. These are the guarantees from SECURITY.md and the code, including what does leave your machine."
          />
          <FactList facts={securityFacts} />
        </div>
      </section>

      <section id="benchmarks" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen scroll-mt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            accent={accentText}
            eyebrow="Benchmarks"
            title="Measured, Not Promised"
            intro="These are the only numbers the project has actually measured."
          />
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden">
            <dl>
              {benchmarks.map((b) => (
                <div key={b.op} className="grid gap-1 md:grid-cols-[1fr_220px] px-6 py-4 border-b last:border-b-0 border-espresso/5">
                  <dt className="text-sm text-espresso/70">{b.op}</dt>
                  <dd className="text-sm font-semibold text-espresso font-mono">{b.val}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-4 text-xs text-espresso/50 leading-relaxed max-w-3xl">
            <Rich text={benchmarkNote} />
          </p>
        </div>
      </section>

      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          Mono Agent v{ARCH_VERSION} · Architecture · {ARCH_DATE} ·{" "}
          <Link href="/projects/mono-agent" className="hover:text-espresso/60 transition-colors">
            ← Back to Mono Agent
          </Link>
        </p>
      </footer>
    </div>
  );
}
