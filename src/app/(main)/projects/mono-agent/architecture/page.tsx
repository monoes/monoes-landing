import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mono Agent Architecture",
  description:
    "Technical architecture of Mono Agent: 105 node types, 130K+ lines of Go (excluding tests), a DAG workflow engine, and 50+ SQLite tables. Workflow automation internals.",
  alternates: { canonical: "/projects/mono-agent/architecture" },
};

const accent = "#C8A97E";

const heroStats = [
  { value: "105", label: "Node Types" },
  { value: "130K+", label: "Lines of Go" },
  { value: "4", label: "Trigger Types" },
  { value: "50+", label: "DB Tables" },
  { value: "20", label: "Max Workers" },
  { value: "10+", label: "Agent Runtimes" },
];

const modules = [
  {
    icon: "⚡",
    subtitle: "Workflow Engine",
    name: "internal/workflow/",
    description: "DAG-based execution orchestrator. Kahn's algorithm for topological sort and cycle detection. BFS stack execution: branches run sequentially in a single goroutine, not parallel goroutines. Manages execution queue (default depth 1,000), worker pool (default 3, max 20), and trigger registry (manual, cron, webhook, org).",
    tags: ["DAG", "Kahn's algo", "BFS stack", "worker pool", "webhook"],
    color: "#C8A97E",
  },
  {
    icon: "🎬",
    subtitle: "Action Executor",
    name: "internal/action/",
    description: "Interprets 64 embedded JSON action definitions across 7 platforms (Instagram 18, TikTok 16, LinkedIn 12, X 7, Gemini 4, Hacker News 4, Product Hunt 3). About 20 step types: navigate, click, type, upload, scroll, hover, extract_text, extract_multiple, condition, loop, call_bot_method, save_data, mark_failed, and more. Supports nested loops with recursion guards. Social platform actions compile only with -tags social.",
    tags: ["64 JSON defs", "~20 step types", "go:embed", "{{template}}"],
    color: "#B8956A",
  },
  {
    icon: "🧩",
    subtitle: "Node Registry",
    name: "internal/nodes/",
    description: "About 190 files implementing 105 node types. NodeTypeRegistry maps type string → factory function; new types are Go code registered at build time. Each node loads its JSON Schema from workflow/schemas/. Control: IF, Switch, Merge, Wait, Split in Batches, Filter, Human-in-Loop. Services: HTTP, Postgres/MySQL/MongoDB/Redis, Email, Slack, GitHub, Linear, Stripe, and 20+ more.",
    tags: ["~190 files", "127 schemas", "registry", "JSON Schema"],
    color: "#A07840",
  },
  {
    icon: "🌐",
    subtitle: "Browser Layer",
    name: "internal/browser/",
    description: "Rod (Chrome DevTools Protocol). By default it drives your own logged-in Chrome through a paired, loopback-only extension bridge. Paced typing (50–250 ms per key) keeps long sessions stable. Page pool reuses one page per platform and session.",
    tags: ["Rod/CDP", "extension bridge", "paced input", "page pool"],
    color: "#8B7355",
  },
  {
    icon: "🤖",
    subtitle: "Platform Bots",
    name: "internal/bot/",
    description: "Platform-specific DOM navigators and data extractors for Instagram, LinkedIn, X, TikTok, Hacker News, Product Hunt, Gemini, Telegram, and Email. Social platforms only with -tags social. Tier-1 in the 3-tier fallback: Go code (reliable, version-locked). Handles K/M number conversion (12.5K→12500), deduplication, and batch SQLite saves.",
    tags: ["9 adapters", "K/M parse", "dedup", "batch saves"],
    color: "#C8A97E",
  },
  {
    icon: "🗄",
    subtitle: "Storage",
    name: "internal/storage/",
    description: "SQLite via modernc.org/sqlite (pure Go, no CGO). 50+ tables covering workflows, executions, actions, people, lists, templates, threads, credentials, and platform sessions. Execution history pruning via cron (default: keep last 500 per workflow). JSON export for large-scale people data.",
    tags: ["50+ tables", "pure Go", "no CGO", "JSON export"],
    color: "#B8956A",
  },
  {
    icon: "🔑",
    subtitle: "Auth & Connections",
    name: "internal/connections/",
    description: "Unified connections for 40+ platforms (API key, OAuth2, basic auth, browser session). Secrets live in an AES-256-GCM vault whose key is kept in the OS keyring. Platform session cookies persisted in SQLite, auto-cleanup on expiry. Manual browser login flow captures cookies.",
    tags: ["OAuth2", "40+ platforms", "session cookies", "AES-256-GCM vault"],
    color: "#A07840",
  },
  {
    icon: "🧠",
    subtitle: "AI Integration",
    name: "internal/monomind/ + internal/nodes/agent/",
    description: "AI is handed off to agent CLIs on your machine (Claude Code, Codex, Kimi, Qwen, …) through monomind. agent.ask works as a workflow node, and agent 'orgs' can call workflows as tools. Gemini works through your own browser session, with no API key needed.",
    tags: ["agent.ask", "Claude Code", "Codex", "orgs", "MCP"],
    color: "#8B7355",
  },
];

const executionFlow = [
  {
    num: "1", color: "#C8A97E",
    title: "Trigger Event",
    body: "User runs monoagentcli workflow run <id>, clicks Run in Wails UI, a cron schedule fires (robfig/cron), or a webhook HTTP POST hits :9321/webhook/{id} (127.0.0.1 by default). WorkflowEngine receives the trigger event and creates a WorkflowExecution record with QUEUED status.",
    code: null,
  },
  {
    num: "2", color: "#B8956A",
    title: "DAG Construction",
    body: "ExecutionQueue worker goroutine pops the request. WorkflowStore.ListNodes() and ListConnections() load the workflow graph. DAG.BuildDAG() constructs adjacency lists. Kahn's algorithm validates topological order and detects cycles (returning cycle node IDs if found at save time).",
    code: "DAG.BuildDAG() → Kahn's topological sort → execution stack init",
  },
  {
    num: "3", color: "#A07840",
    title: "BFS Execution Loop",
    body: "Main loop pops (node, inputItems) from the BFS stack. If disabled, skip. ExpressionEngine.ResolveConfig() evaluates {{$json.*}}, {{$node[\"Name\"].*}}, {{$env.NAME}} (only when MONOAGENT_ALLOW_ENV_TEMPLATES=1) in all string config fields. Node is dispatched to registry.Get(nodeType).Execute().",
    code: `// Expression examples:
{{$json.username}}          → current item field
{{$node["Search"].json[0]}} → named node output
{{$env.API_BASE}}           → environment variable (opt-in)
@secret:name                → credential from the vault`,
  },
  {
    num: "4", color: "#8B7355",
    title: "Node Execution",
    body: "Each node type handles its logic. Browser action nodes wrap ActionExecutor (loads JSON defs, runs ~20 step types). Control nodes implement IF/Switch/Merge/Wait/Split in Batches. Transform nodes (Set, Code) use expression engine. Service nodes (HTTP, Slack, GitHub) make external API calls. AI nodes hand prompts to agent CLIs on your machine.",
    code: null,
  },
  {
    num: "5", color: "#C8A97E",
    title: "3-Tier DOM Fallback",
    body: "For browser action nodes needing DOM elements: Tier 1 = call_bot_method (Go code, reliable). Tier 2 = XPath alternatives (human-written, brittle but fast). Tier 3 = selector generated by a local AI agent, with a cached fallback. Each tier skippable with onError: skip.",
    code: "call_bot_method → XPath → local agent selector (cached)",
  },
  {
    num: "6", color: "#B8956A",
    title: "Output Routing",
    body: "Node emits outputs on named handles: main, error, true/false (IF), switch outputs, or custom handles. Each connected downstream node is pushed onto the BFS stack. MERGE nodes accumulate inputs from multiple branches via sync.Mutex-guarded state map, releasing when all expected inputs arrive.",
    code: "outputs[\"main\"] → push connected nodes onto BFS stack",
  },
  {
    num: "7", color: "#A07840",
    title: "Error Handling",
    body: "Per-node on_error: stop, continue, skip, error_branch (emit on error handle with structured NodeError). Partial failures show as SUCCESS_WITH_ERRORS, never green. Execution history saved to workflow_execution_nodes table for debugging.",
    code: null,
  },
  {
    num: "8", color: "#8B7355",
    title: "Execution Complete",
    body: "Stack empties → COMPLETED, or WAITING when paused at a human-in-the-loop node. Stop-error node triggers → FAILED. WorkflowExecution record updated with final status, duration, error message. Result returned to caller (CLI prints summary, Wails UI refreshes, webhook HTTP response returned). History pruned to last 500 per workflow via background cron.",
    code: null,
  },
];

const nodeTypes = [
  { category: "Control & Transform", count: 15, examples: ["IF", "Switch", "Merge", "Wait", "Set", "Code (JS)", "Filter", "Human-in-Loop"], color: "#C8A97E" },
  { category: "Social (opt-in build)", count: 60, examples: ["Instagram", "LinkedIn", "X", "TikTok", "Hacker News", "Product Hunt"], color: "#B8956A" },
  { category: "Service Integrations", count: 24, examples: ["HTTP Request", "Slack", "GitHub", "Linear", "Stripe", "Salesforce", "HubSpot"], color: "#A07840" },
  { category: "AI & Agents", count: 11, examples: ["agent.ask", "org.run", "gemini.generate_image", "ai.extract_page"], color: "#8B7355" },
  { category: "Data & DB", count: 12, examples: ["Postgres", "MySQL", "MongoDB", "Redis", "Spreadsheet", "HTML", "XML", "Crypto"], color: "#C8A97E" },
];


export default function MonoAgentArchitecturePage() {
  return (
    <div className="bg-ivory-warm min-h-screen">
      {/* Header */}
      <div className="border-b border-ivory-linen bg-white/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/projects/mono-agent" className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors">← Mono Agent</Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">Architecture</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Modules", "Execution", "Nodes", "Expressions", "Performance"].map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors">{s}</a>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="px-8 py-24 md:py-32 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <div className="inline-block mb-6 text-xs font-semibold uppercase tracking-label px-3 py-1 rounded-full border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
            Go 1.26.0 · Rod CDP · DAG Engine
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>Mono Agent</span>
            <br />Orchestrates Workflows
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            130K+ lines of Go. A DAG workflow engine with 105 node types, human-in-the-loop approvals, AI handed to agent CLIs on your machine, browser automation in your own Chrome, and a Wails desktop UI.
          </p>
          <div className="inline-flex flex-wrap gap-px overflow-hidden rounded-xl border border-espresso/10 bg-espresso/5">
            {heroStats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-start gap-1 px-6 py-4 bg-white/80">
                <span className="text-2xl font-semibold leading-none tracking-tight" style={{ color: accent }}>{value}</span>
                <span className="text-[10px] uppercase tracking-label font-medium text-espresso/45">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture diagram */}
      <section className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Architecture</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">System Overview</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            WorkflowEngine is the central coordinator. Every trigger flows through the DAG executor, dispatching to the node registry. Browser, AI, and service nodes all share a single SQLite store.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg viewBox="0 0 900 440" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ fontFamily: "Satoshi, -apple-system, sans-serif" }}>
              <defs>
                <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="rgba(42,35,24,0.25)" />
                </marker>
                <marker id="arr3-acc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#C8A97E" />
                </marker>
              </defs>

              {/* Triggers row */}
              <rect x="30" y="18" width="100" height="44" rx="8" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1.3"/>
              <text x="80" y="36" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Manual</text>
              <text x="80" y="52" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">CLI / UI</text>

              <rect x="145" y="18" width="100" height="44" rx="8" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1.3"/>
              <text x="195" y="36" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Cron</text>
              <text x="195" y="52" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">robfig/cron</text>

              <rect x="260" y="18" width="100" height="44" rx="8" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1.3"/>
              <text x="310" y="36" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Webhook</text>
              <text x="310" y="52" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">:9321/webhook</text>

              {/* WorkflowEngine */}
              <rect x="110" y="95" width="270" height="65" rx="12" fill="rgba(200,169,126,0.12)" stroke="#C8A97E" strokeWidth="2"/>
              <text x="245" y="120" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">WorkflowEngine</text>
              <text x="245" y="138" textAnchor="middle" fill="#C8A97E" fontSize="10" fontWeight="600">DAG Builder · ExecutionQueue · Worker Pool</text>
              <text x="245" y="152" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">Kahn&apos;s topological sort · BFS execution stack</text>

              {/* ActionExecutor */}
              <rect x="420" y="95" width="200" height="65" rx="10" fill="rgba(184,149,106,0.1)" stroke="#B8956A" strokeWidth="1.5"/>
              <text x="520" y="118" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">ActionExecutor</text>
              <text x="520" y="135" textAnchor="middle" fill="#B8956A" fontSize="10">~20 step types · go:embed</text>
              <text x="520" y="150" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">64 JSON action defs</text>

              {/* ExpressionEngine */}
              <rect x="640" y="95" width="220" height="65" rx="10" fill="rgba(160,120,64,0.1)" stroke="#A07840" strokeWidth="1.5"/>
              <text x="750" y="118" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">ExpressionEngine</text>
              <text x="750" y="135" textAnchor="middle" fill="#A07840" fontSize="10">text/template · FuncMap</text>
              <text x="750" y="150" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">{`{{$json.*}} · {{$env.X}} · {{$node[...]}}`}</text>

              {/* Node Registry row */}
              <rect x="30" y="198" width="130" height="58" rx="9" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2"/>
              <text x="95" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Browser</text>
              <text x="95" y="238" textAnchor="middle" fill="#8B7355" fontSize="9">Rod · CDP</text>
              <text x="95" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">your Chrome · paired</text>

              <rect x="173" y="198" width="130" height="58" rx="9" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.2"/>
              <text x="238" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Bot Layer</text>
              <text x="238" y="238" textAnchor="middle" fill="#C8A97E" fontSize="9">opt-in build</text>
              <text x="238" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">IG · LI · X · TikTok</text>

              <rect x="316" y="198" width="130" height="58" rx="9" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.2"/>
              <text x="381" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Agents</text>
              <text x="381" y="238" textAnchor="middle" fill="#A07840" fontSize="9">agent.ask</text>
              <text x="381" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">Claude Code · Codex</text>

              <rect x="459" y="198" width="130" height="58" rx="9" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.2"/>
              <text x="524" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Services</text>
              <text x="524" y="238" textAnchor="middle" fill="#B8956A" fontSize="9">HTTP · Slack · DB</text>
              <text x="524" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">GitHub · Linear · ...</text>

              <rect x="602" y="198" width="130" height="58" rx="9" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2"/>
              <text x="667" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Control</text>
              <text x="667" y="238" textAnchor="middle" fill="#8B7355" fontSize="9">IF · Switch · Filter</text>
              <text x="667" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">Merge · Wait · Set</text>

              {/* Config Manager */}
              <rect x="745" y="198" width="120" height="58" rx="9" fill="rgba(200,169,126,0.06)" stroke="#C8A97E" strokeWidth="1.1" strokeDasharray="3,2"/>
              <text x="805" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Config Mgr</text>
              <text x="805" y="238" textAnchor="middle" fill="#C8A97E" fontSize="9">3-tier DOM</text>
              <text x="805" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">bot→XPath→AI</text>

              {/* Storage layer */}
              <rect x="30" y="295" width="835" height="50" rx="10" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1.2"/>
              <text x="447" y="315" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="11" fontWeight="700">Storage Layer (modernc.org/sqlite · Pure Go · No CGO)</text>
              <text x="447" y="333" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9.5">workflows · executions · actions · people · lists · credentials · sessions · templates · threads</text>

              {/* Connections */}
              {[80, 195, 310].map((x) => (
                <line key={x} x1={x} y1="62" x2={245} y2="95" stroke="#C8A97E" strokeWidth="1.2" markerEnd="url(#arr3-acc)" strokeOpacity="0.5"/>
              ))}
              <line x1="380" y1="140" x2="420" y2="140" stroke="#B8956A" strokeWidth="1.2" markerEnd="url(#arr3)" strokeOpacity="0.5"/>
              <line x1="380" y1="132" x2="640" y2="132" stroke="#A07840" strokeWidth="1.2" markerEnd="url(#arr3)" strokeOpacity="0.5"/>

              {[95, 238, 381, 524, 667, 805].map((x) => (
                <line key={x} x1={x} y1="160" x2={x > 600 ? 700 : x} y2="198" stroke="rgba(42,35,24,0.15)" strokeWidth="1.1" markerEnd="url(#arr3)" strokeDasharray="4,3"/>
              ))}

              {[95, 238, 381, 524, 667].map((x) => (
                <line key={x} x1={x} y1="256" x2={447} y2="295" stroke="rgba(42,35,24,0.1)" strokeWidth="1" markerEnd="url(#arr3)" strokeDasharray="3,4"/>
              ))}

              {/* Chrome browser external */}
              <rect x="30" y="375" width="150" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1"/>
              <text x="105" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">Your Chrome (extension)</text>
              <text x="105" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">Rod DevTools Protocol</text>

              <rect x="200" y="375" width="150" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1"/>
              <text x="275" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">External APIs</text>
              <text x="275" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">Slack · GitHub · Linear · ...</text>

              <rect x="370" y="375" width="150" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1"/>
              <text x="445" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">Agent CLIs</text>
              <text x="445" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">via monomind</text>

              <line x1="95" y1="345" x2="95" y2="375" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr3)"/>
              <line x1="238" y1="345" x2="270" y2="375" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr3)"/>
              <line x1="381" y1="345" x2="440" y2="375" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr3)"/>

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

      {/* Modules */}
      <section id="modules" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Internal Packages</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">8 Core Modules</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            130K+ lines of Go across 900+ files. Clean separation between engine, execution, browser, and storage layers.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m) => (
              <div key={m.name} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft hover:shadow-soft-lg hover:border-espresso/20 transition-all duration-200"
                style={{ borderTop: `3px solid ${m.color}` }}>
                <div className="text-2xl mb-3">{m.icon}</div>
                <p className="text-[10px] uppercase tracking-label font-semibold mb-1" style={{ color: m.color }}>{m.subtitle}</p>
                <h3 className="text-xs font-semibold text-espresso mb-2 font-mono">{m.name}</h3>
                <p className="text-xs text-espresso/60 leading-relaxed mb-4">{m.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                      style={{ color: m.color, borderColor: `${m.color}40`, background: `${m.color}08` }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Execution Flow */}
      <section id="execution" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Execution</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Workflow Execution Flow</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            From trigger to result: 8 steps through the DAG executor, expression engine, and node registry.
          </p>
          <div className="flex flex-col gap-4">
            {executionFlow.map((step) => (
              <div key={step.num} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: step.color }}>{step.num}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-espresso mb-2">{step.title}</h4>
                  <p className="text-sm text-espresso/60 leading-relaxed mb-3">{step.body}</p>
                  {step.code && (
                    <pre className="text-xs bg-ivory-warm border border-espresso/8 rounded-lg px-4 py-3 text-espresso/70 font-mono leading-relaxed overflow-x-auto">{step.code}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Node Types */}
      <section id="nodes" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Node Registry</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">105 Node Types</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Every node registers with NodeTypeRegistry → factory function mapping. Each loads its JSON Schema from workflow/schemas/. New node types are Go code registered at build time.
          </p>
          <div className="flex flex-col gap-4 mb-8">
            {nodeTypes.map((nt) => (
              <div key={nt.category} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                  style={{ background: nt.color }}>{nt.count}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-espresso mb-2">{nt.category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {nt.examples.map((e) => (
                      <span key={e} className="text-[11px] font-medium px-2.5 py-1 rounded-lg border"
                        style={{ color: nt.color, borderColor: `${nt.color}40`, background: `${nt.color}08` }}>{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3-Tier DOM */}
          <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">3-Tier DOM Fallback (Browser Nodes)</p>
            <div className="flex flex-col gap-3">
              {[
                { tier: "Tier 1", label: "call_bot_method", desc: "Go code in bot layer: reliable, version-locked, fastest", conf: "most stable" },
                { tier: "Tier 2", label: "XPath alternatives", desc: "Human-written selectors, faster than AI but brittle if platform changes UI", conf: "fallback" },
                { tier: "Tier 3", label: "AI-generated CSS", desc: "Selector generated by a local AI agent, with a cached fallback", conf: "last resort" },
              ].map((t) => (
                <div key={t.tier} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded border" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}0d` }}>{t.tier}</span>
                  <div>
                    <span className="text-xs font-mono font-semibold text-espresso">{t.label}</span>
                    <span className="text-xs text-espresso/50 ml-2">- {t.desc}</span>
                  </div>
                  <span className="text-xs text-espresso/40">{t.conf}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expression Engine */}
      <section id="expressions" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Expression Engine</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Go text/template + FuncMap</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            All string config fields in every node are resolved through ExpressionEngine before execution. Expressions are Go templates with a fixed FuncMap. Custom logic goes in the core.code node (JavaScript via the embedded Goja engine).
          </p>
          <div className="grid gap-3 sm:grid-cols-2 mb-8">
            {[
              { expr: "{{$json.username}}", desc: "Field from the current item (output of previous node)" },
              { expr: '{{$node["Search"].json[0].title}}', desc: "Output of a specific named upstream node" },
              { expr: "{{$workflow.id}}", desc: "Workflow metadata (id, name, created_at)" },
              { expr: "{{$execution.id}}", desc: "Current execution runtime info" },
              { expr: "{{$env.API_BASE}}", desc: "OS environment variable (opt-in via MONOAGENT_ALLOW_ENV_TEMPLATES=1)" },
              { expr: "{{len $json.items}}", desc: "Array length: built-in template function" },
              { expr: "{{now}}", desc: "Current timestamp as an RFC3339 string" },
              { expr: "{{index $json.tags 0}}", desc: "Array index access via Go template built-in" },
            ].map((e) => (
              <div key={e.expr} className="rounded-xl border border-espresso/10 bg-white p-4 shadow-soft flex gap-3 items-start">
                <code className="text-[11px] font-mono font-bold whitespace-nowrap" style={{ color: accent }}>{e.expr}</code>
                <p className="text-xs text-espresso/55 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">Key Architectural Decision</p>
            <p className="text-sm text-espresso/65 leading-relaxed">
              <strong className="text-espresso">Go text/template for expressions</strong>: no eval sandboxing required. Custom logic goes in the core.code node (JavaScript via the embedded Goja engine). Expressions are limited by the FuncMap (no arbitrary Go access). Simple enough for non-technical users, composable for power users. Go&apos;s template engine is battle-tested with zero external runtime overhead.
            </p>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section id="performance" className="px-8 py-20 bg-ivory-warm">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Performance</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Execution Design</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Go + single-goroutine BFS execution eliminates race conditions. In practice, run time is dominated by the network: browser, AI agents, and APIs.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Why BFS, Not Goroutines?", body: "Browser actions are seconds-to-minutes. Spawning goroutines per branch adds overhead without benefit. Parallel execution uses the worker pool instead. Multiple workflows run concurrently, not multiple branches within one." },
              { title: "Pure Go SQLite", body: "modernc.org/sqlite is a CGO-free port of SQLite. Zero C compilation, single static binary, no system SQLite dependency. Trades some raw speed versus CGO builds for cross-compilation and Docker-free deployment." },
              { title: "Single Binary", body: "go:embed packs all action definitions, node schemas, migrations, and templates into the CLI: one executable of about 65 MB. The desktop app is a separate download." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
                <h4 className="text-sm font-semibold text-espresso mb-2">{c.title}</h4>
                <p className="text-xs text-espresso/60 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          Mono Agent · Go 1.26.0 · Rod · Wails · Architecture 2026-09-04 ·{" "}
          <Link href="/projects/mono-agent" className="hover:text-espresso/60 transition-colors">← Back to Mono Agent</Link>
        </p>
      </footer>
    </div>
  );
}
