import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Monomind Architecture",
  description:
    "Technical architecture of Monomind: 8 packages, 32 CLI commands, 8 background workers, and 46 Monograph MCP tools. Explore the monorepo structure.",
  alternates: { canonical: "/projects/monomind/architecture" },
  openGraph: {
    title: "Monomind Architecture - 8 packages, 46 MCP tools",
    description: "Deep dive into Monomind's technical architecture and monorepo structure.",
  },
};

const accent = "#8B6914";

const stats = [
  { value: "8", label: "Packages" },
  { value: "32", label: "CLI Commands" },
  { value: "7", label: "Background Workers" },
  { value: "46", label: "Monograph MCP Tools" },
];

const components = [
  {
    icon: "⌨",
    subtitle: "CLI Entry Point",
    name: "@monoes/monomindcli",
    path: "packages/@monomind/cli/",
    description:
      "The published CLI package (installed as the `monomind` umbrella from repo root). 32 top-level commands, in-process agent/swarm lifecycle, and a hand-rolled stdio JSON-RPC MCP server: no separate MCP process required for the default transport.",
    tags: ["32 commands", "stdio JSON-RPC", "in-process agents"],
    color: "#8B6914",
  },
  {
    icon: "🪝",
    subtitle: "Hooks & Workers",
    name: "@monoes/hooks",
    path: "packages/@monomind/hooks/",
    description:
      "Typed HookEvent registry/executor library plus a WorkerManager running 8 background workers. Bridged into the live dispatch path via .claude/helpers, which is the mechanism Claude Code actually calls.",
    tags: ["20 HookEvent types", "8 workers", "registry + executor"],
    color: "#8B7355",
  },
  {
    icon: "🔌",
    subtitle: "MCP Framework",
    name: "@monoes/mcp",
    path: "packages/@monomind/mcp/",
    description:
      "MCP server framework powering `mcp start -t http`/`-t websocket` and stdio/in-process transports, with session, connection, resource, prompt, and rate-limiting support. The default stdio setup Claude Code connects to does not import this package. It uses the CLI's own hand-rolled loop.",
    tags: ["http/websocket", "OAuth", "rate limiting"],
    color: "#B8956A",
  },
  {
    icon: "💾",
    subtitle: "Memory Backend",
    name: "@monoes/memory",
    path: "packages/@monomind/memory/",
    description:
      "Lower-level memory backend library: SQLite (better-sqlite3, sql.js WASM fallback) and a pure-JS HNSW index. The live bridge that CLI memory commands and MCP memory tools actually call lives in the CLI package, dynamically importing this one. LanceDB was fully removed in v2.3.1.",
    tags: ["SQLite", "local embeddings", "HNSW (opt-in)"],
    color: "#A07840",
  },
  {
    icon: "🗺",
    subtitle: "Knowledge Graph",
    name: "@monoes/monograph",
    path: "packages/@monomind/monograph/",
    description:
      "Tree-sitter + SQLite code dependency graph. 14 full tree-sitter grammars (TypeScript's covers JS/JSX/MJS/CJS) plus 5 lightweight regex-based symbol extractors. 19 default MCP tools, 27 more behind MONOGRAPH_MCP_ADVANCED=1, 46 total.",
    tags: ["14 grammars", "46 MCP tools", "PPR rerank on by default"],
    color: "#C8A97E",
  },
  {
    icon: "🔀",
    subtitle: "Semantic Routing",
    name: "@monoes/routing",
    path: "packages/@monomind/routing/",
    description:
      "Opt-in RouteLayer algorithm: keyword pre-filter, then real embeddings via an isolated worker process, then cosine similarity, then a Haiku LLM fallback below threshold. Reached via `route semantic`, `agent --task`, or MCP hooks_route_semantic. Bare `monomind route` uses a separate keyword-only stub instead.",
    tags: ["keyword pre-filter", "out-of-process embeddings", "LLM fallback"],
    color: "#8B6914",
  },
  {
    icon: "🌐",
    subtitle: "Browser Automation",
    name: "@monoes/monobrowse",
    path: "packages/@monoes/monobrowse/",
    description:
      "Standalone Chrome DevTools Protocol (CDP) client for browser automation (no Playwright, Puppeteer, or Selenium dependency). Powers `monomind browse` and the agent-browser-testing workflow.",
    tags: ["native CDP", "no external binary"],
    color: "#8B7355",
  },
  {
    icon: "🎨",
    subtitle: "Design Intelligence",
    name: "@monoes/monodesign",
    path: "packages/@monoes/monodesign/",
    description:
      "Independent frontend design intelligence package: design tokens, antipattern detection, and the monodesign skill. Replaced the earlier set of separate design-agent roles (UI Designer, UX Architect, Brand Guardian, etc.) with one unified system.",
    tags: ["design tokens", "antipattern detection"],
    color: "#B8956A",
  },
];

const memoryFacts = [
  {
    badge: "01",
    color: "#8B6914",
    title: "Local SQLite, not a cloud vector DB",
    body: "The default memory engine is local SQLite with embedded vectors: better-sqlite3 primary, sql.js WASM as fallback. Embeddings are computed locally with Xenova/all-MiniLM-L6-v2 (384 dimensions). This backs CLI memory store/search, the MCP memory tools, and the Second Brain.",
  },
  {
    badge: "02",
    color: "#8B7355",
    title: "LanceDB removed, not replaced-in-place",
    body: "LanceDB (~600MB of native dependencies) was fully removed in v2.3.1 (2026-07-18) once the local SQLite engine was measured to work for Second Brain retrieval. Some internal comments and a health-check label still say \"lancedb\" as a stale string literal; cosmetic, not a live dependency.",
  },
  {
    badge: "03",
    color: "#B8956A",
    title: "HNSW exists, but it's opt-in",
    body: "A pure-JS HNSW index ships in the memory package, but it is not on the default search path. It's reachable explicitly via `memory search --build-hnsw`. Don't expect vector-index speedups on a default `memory search` call.",
  },
  {
    badge: "04",
    color: "#A07840",
    title: "A separate JSON pattern store powers hooks/intelligence",
    body: "Hook and trajectory learning (routing outcomes, edit patterns) is stored in JSON files (patterns.json, auto-memory-store.json), independent of the SQLite backend above. These are three genuinely separate mechanisms that happen to all be called \"memory,\" not yet consolidated into one system.",
  },
];

const routingSteps = [
  {
    num: "1",
    color: "#8B6914",
    title: "Bare `monomind route \"task\"`: keyword stub",
    body: "The default, zero-config path is a lightweight keyword-only router (createKeywordRouter): a fixed if/else chain over ~8 hardcoded categories, always returns confidence 0.75, no embeddings, no learning. It lives in the CLI package, not in @monoes/routing.",
  },
  {
    num: "2",
    color: "#B8956A",
    title: "`route semantic`, `agent --task`, or MCP hooks_route_semantic: real routing",
    body: "These entry points use @monoes/routing's RouteLayer: a keyword pre-filter first (first match wins, deterministic), then a real embedding model run in an isolated worker process (kept out-of-process because loading onnxruntime in-process causes SIGSEGVs), scored by cosine similarity against each route's centroid.",
  },
  {
    num: "3",
    color: "#A07840",
    title: "Threshold gate → Haiku LLM fallback",
    body: "If the best semantic match scores below the configured threshold (default 0.5), routing falls back to a Haiku LLM classification call instead of guessing. This is the only place an LLM call is part of routing itself.",
  },
  {
    num: "4",
    color: "#8B7355",
    title: "Route-outcome correlation, measured by `doctor`",
    body: "Every routing decision (from either path) can be recorded to route-outcomes.jsonl and later joined against what actually happened, producing accuracy/adherence metrics surfaced by `monomind doctor`.",
  },
];

const hookGroups = [
  {
    title: "29 `hooks` CLI subcommands",
    items: [
      "pre-edit / post-edit, pre-command / post-command, pre-task / post-task",
      "session-start, session-end, session-restore, notify",
      "route, explain, pretrain, build-agents, transfer, metrics",
      "intelligence (trajectory-start/step/end, pattern-store/search, stats, attention)",
      "worker, statusline, list, coverage-route, coverage-suggest, coverage-gaps",
      "model-route, model-outcome, model-stats",
    ],
  },
  {
    title: "20 typed HookEvent registry/executor values",
    items: [
      "A separate, lower-level mechanism in @monoes/hooks: PreToolUse, PostToolUse, PreEdit, PostEdit, PreRead, PostRead, PreCommand, PostCommand, PreTask, PostTask, TaskProgress, SessionStart, SessionEnd, SessionRestore, AgentSpawn, AgentTerminate, PreRoute, PostRoute, PatternLearned, PatternConsolidated.",
      "These are not CLI subcommand names. They're the registry's in-memory event types, dispatched by the live .claude/helpers path, which bridges into this package's WorkerManager.",
    ],
  },
  {
    title: "8 background workers",
    items: [
      "8 workers: health, security, code mapping, audit consolidation, and others",
      "Metrics-producing workers auto-refresh at session start when their output is missing or older than 6 hours.",
    ],
  },
];

const orgFacts = [
  { label: "Runtime", value: "SDK-backed daemon", desc: "monomind org run/serve: each role is a live, in-process Claude Agent SDK session, not a subprocess." },
  { label: "Subcommands", value: "16", desc: "run [--dry-run], stop, status, serve, test-loop, logs, report, memory, questions, answer, create, validate, migrate, list, delete, mark-complete." },
  { label: "Inter-agent channel", value: "org_send / Mailbox", desc: "The only way roles communicate, plus ask_human for human-in-the-loop and org_recall/org_remember/org_learn for cross-run memory." },
  { label: "Config", value: ".monomind/orgs/<name>.json", desc: "Parsed against a zod schema: goal, schedule, run_config (budget, concurrency), and a role list with per-role tool/file/web policy." },
];

const honestNotes = [
  "Swarm/hive-mind consensus (Byzantine, Raft, Quorum) is single-process vote counting today, not distributed consensus. Gossip and CRDT are planned but not implemented.",
  "The default `monomind route` command is a keyword-only stub, not the semantic RouteLayer. Don't confuse the two when reading routing output.",
  "HNSW vector search exists but is opt-in only (`memory search --build-hnsw`); it is not part of the default memory search path.",
  "The former @monomind/security package was deleted; input validation now lives inline at packages/@monomind/cli/src/utils/input-guards.ts; there is no standalone security package.",
  "Exact secret-scanner / injection-detector rule counts are not published here. We'd rather say \"built-in secret and injection scanning\" than cite a number we haven't verified against the current source.",
];

export default function MonomindArchitecturePage() {
  return (
    <div className="bg-ivory-warm min-h-screen">
      {/* ── Header ── */}
      <div className="border-b border-ivory-linen bg-white/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/projects/monomind"
              className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors"
            >
              ← Monomind
            </Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">Architecture</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Overview", "Packages", "Memory", "Routing", "Hooks", "Org Runtime", "Notes"].map((item) => (
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

      {/* ── Hero ── */}
      <section className="px-8 py-24 md:py-32 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <div
            className="inline-block mb-6 text-xs font-semibold uppercase tracking-label px-3 py-1 rounded-full border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
          >
            v2.5.4 · Technical Architecture
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>Monomind</span>
            <br />Is Actually Built
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            An 8-package monorepo wiring Claude Code hooks, local memory, a code knowledge graph, and an SDK-backed org runtime together. Every number below is checked against the current source, not carried over from an old design doc.
          </p>
          {/* Stats */}
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

      {/* ── System Overview ── */}
      <section id="overview" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Architecture</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">System Overview</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Claude Code talks to the CLI package over a hand-rolled stdio JSON-RPC loop. The CLI dynamically imports the other 7 packages as needed. Most are libraries, not always-running services.
          </p>

          {/* SVG Diagram */}
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg
              viewBox="0 0 900 460"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              style={{ fontFamily: "Satoshi, -apple-system, sans-serif" }}
            >
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="rgba(42,35,24,0.3)" />
                </marker>
                <marker id="arrow-gold" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#8B6914" />
                </marker>
              </defs>

              {/* Claude Code top bar */}
              <rect x="50" y="20" width="800" height="60" rx="10" fill="rgba(139,105,20,0.06)" stroke="#8B6914" strokeWidth="1.5" strokeOpacity="0.5" />
              <text x="450" y="45" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">CLAUDE CODE (IDE / CLI)</text>
              <text x="450" y="65" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="11">stdio JSON-RPC ↔ @monoes/monomindcli (packages/@monomind/cli/)</text>

              {/* Arrow down */}
              <line x1="450" y1="80" x2="450" y2="115" stroke="#8B6914" strokeWidth="1.5" markerEnd="url(#arrow-gold)" strokeOpacity="0.7" />

              {/* CLI box */}
              <rect x="290" y="120" width="320" height="55" rx="12" fill="rgba(139,105,20,0.08)" stroke="#8B6914" strokeWidth="2" />
              <text x="450" y="145" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">@monoes/monomindcli</text>
              <text x="450" y="163" textAnchor="middle" fill="#8B6914" fontSize="10" fontWeight="600">32 commands · dynamically imports the packages below</text>

              {/* Lines from CLI to 4 package rows */}
              <path d="M 360 175 L 130 210" stroke="rgba(139,115,85,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 420 175 L 330 210" stroke="rgba(184,149,106,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 480 175 L 570 210" stroke="rgba(160,120,64,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 540 175 L 770 210" stroke="rgba(200,169,126,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />

              {/* Row 1: hooks / mcp / memory / routing */}
              <rect x="40" y="215" width="180" height="60" rx="10" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.5" />
              <text x="130" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/hooks</text>
              <text x="130" y="256" textAnchor="middle" fill="#8B7355" fontSize="9" fontWeight="600">Registry + 8 workers</text>

              <rect x="240" y="215" width="180" height="60" rx="10" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.5" />
              <text x="330" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/memory</text>
              <text x="330" y="256" textAnchor="middle" fill="#B8956A" fontSize="9" fontWeight="600">SQLite + local embeddings</text>

              <rect x="440" y="215" width="180" height="60" rx="10" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.5" />
              <text x="530" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/monograph</text>
              <text x="530" y="256" textAnchor="middle" fill="#A07840" fontSize="9" fontWeight="600">tree-sitter + SQLite graph</text>

              <rect x="640" y="215" width="180" height="60" rx="10" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.5" />
              <text x="730" y="240" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/routing</text>
              <text x="730" y="256" textAnchor="middle" fill="#C8A97E" fontSize="9" fontWeight="600">opt-in RouteLayer</text>

              {/* Downward arrows to storage */}
              <path d="M 130 275 L 130 320" stroke="rgba(139,115,85,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M 330 275 L 330 320" stroke="rgba(184,149,106,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M 530 275 L 530 320" stroke="rgba(160,120,64,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />

              {/* Storage boxes */}
              <rect x="40" y="325" width="180" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="130" y="346" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10" fontWeight="600">.monomind/metrics/</text>
              <text x="130" y="362" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">worker JSON outputs</text>

              <rect x="240" y="325" width="180" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="330" y="346" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10" fontWeight="600">SQLite (better-sqlite3)</text>
              <text x="330" y="362" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">sql.js WASM fallback</text>

              <rect x="440" y="325" width="180" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="530" y="346" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10" fontWeight="600">.monomind/monograph.db</text>
              <text x="530" y="362" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">nodes · edges · communities</text>

              {/* Standalone packages bar */}
              <rect x="60" y="400" width="780" height="45" rx="10" fill="rgba(42,35,24,0.02)" stroke="rgba(42,35,24,0.06)" strokeWidth="1" />
              <text x="450" y="420" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="11" fontWeight="600">Standalone: @monoes/monobrowse (CDP browser automation) · @monoes/monodesign (design intelligence)</text>
              <text x="450" y="436" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">packages/@monoes/: path scope matches published npm scope for these two only</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section id="packages" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Modules</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">8 Packages</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            6 live under packages/@monomind/ (cli, hooks, mcp, memory, monograph, routing); all but cli publish under the @monoes/ npm scope despite the @monomind/ directory name. 2 live under packages/@monoes/ (monobrowse, monodesign), where path and publish scope match.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <p className="text-xs text-espresso/60 leading-relaxed mb-4">{c.description}</p>
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

      {/* ── Memory ── */}
      <section id="memory" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Memory</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Local SQLite, Not a Vector Cloud Service</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Three genuinely separate mechanisms share the word &ldquo;memory&rdquo; in this codebase. Here&apos;s what each one actually is.
          </p>
          <div className="flex flex-col gap-4">
            {memoryFacts.map((f) => (
              <div
                key={f.badge}
                className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5 items-start"
                style={{ borderLeft: `4px solid ${f.color}` }}
              >
                <div className="text-xl font-black min-w-[40px] text-center" style={{ color: f.color }}>
                  {f.badge}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-espresso mb-1">{f.title}</h4>
                  <p className="text-sm text-espresso/60 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Routing ── */}
      <section id="routing" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Routing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Keyword by Default, Semantic on Request</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            The routing story has two distinct paths. Don&apos;t mistake the default for the semantic one.
          </p>
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
                    <h5 className="text-sm font-semibold text-espresso mb-1">{step.title}</h5>
                    <p className="text-xs text-espresso/55 leading-relaxed">{step.body}</p>
                  </div>
                </div>
                {i < routingSteps.length - 1 && (
                  <div className="text-center text-espresso/25 text-lg py-1">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hooks ── */}
      <section id="hooks" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Hook System</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Two Different Things Called &quot;Hooks&quot;</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            29 CLI subcommands and 20 typed registry events are different mechanisms that happen to share a name, plus 8 background workers underneath both.
          </p>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {hookGroups.map((g) => (
              <div key={g.title} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
                <h4 className="text-sm font-semibold text-espresso mb-3">{g.title}</h4>
                <ul className="flex flex-col gap-2">
                  {g.items.map((item) => (
                    <li key={item} className="text-xs text-espresso/60 leading-relaxed font-mono">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Org Runtime ── */}
      <section id="org-runtime" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Org Runtime v2</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">SDK-Backed Agent Orgs</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            monomind org run/serve replaces the older prompt-orchestrated runorg path. Each role is a live agent session, not a scripted prompt loop.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {orgFacts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
                <p className="text-[10px] uppercase tracking-label font-bold mb-2" style={{ color: accent }}>{f.label}</p>
                <p className="text-base font-semibold text-espresso mb-2">{f.value}</p>
                <p className="text-xs text-espresso/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notes ── */}
      <section id="notes" className="px-8 py-20 bg-ivory-parchment">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Honesty Notes</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">What We Won&apos;t Overclaim</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            A short list of things that are easy to overstate. We&apos;d rather say them plainly here than have you find out later.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <ul className="flex flex-col gap-4">
              {honestNotes.map((note) => (
                <li key={note} className="text-sm text-espresso/65 leading-relaxed flex gap-3">
                  <span style={{ color: accent }}>-</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          Monomind v2.5.4 · Architecture · 2026-07-21 ·{" "}
          <Link href="/projects/monomind" className="hover:text-espresso/60 transition-colors">
            ← Back to Monomind
          </Link>
        </p>
      </footer>
    </div>
  );
}
