import Link from "next/link";

const accent = "#C8A97E";

const heroStats = [
  { value: "73", label: "Node Types" },
  { value: "52K+", label: "Lines of Go" },
  { value: "6", label: "Social Platforms" },
  { value: "40+", label: "DB Tables" },
  { value: "20", label: "Max Workers" },
  { value: "200+", label: "AI Models" },
];

const modules = [
  {
    icon: "⚡",
    subtitle: "Workflow Engine",
    name: "internal/workflow/",
    description: "DAG-based execution orchestrator. Kahn's algorithm for topological sort and cycle detection. BFS stack execution — branches run sequentially in a single goroutine, not parallel goroutines. Manages execution queue (default depth 1,000), worker pool (default 3, max 20), and trigger registry (manual, cron, webhook).",
    tags: ["5,269 LOC", "DAG", "Kahn's algo", "BFS stack", "worker pool", "webhook"],
    color: "#C8A97E",
  },
  {
    icon: "🎬",
    subtitle: "Action Executor",
    name: "internal/action/",
    description: "Interprets 29 embedded JSON action definitions across 4 platforms (Instagram 8, LinkedIn 7, X 7, TikTok 7). Dispatches 17 step types: navigate, click, type, extract_text, extract_multiple, condition, loop, call_bot_method, save_data, mark_failed, and more. Supports nested loops with recursion guards.",
    tags: ["5,236 LOC", "29 JSON defs", "17 step types", "go:embed", "{{template}}"],
    color: "#B8956A",
  },
  {
    icon: "🧩",
    subtitle: "Node Registry",
    name: "internal/nodes/",
    description: "73 files implementing 50+ node types. NodeTypeRegistry maps type string → factory function, enabling runtime plugin registration. Each node loads its JSON Schema from workflow/schemas/. Control nodes: IF, Switch, Merge, Wait, Loop. Service nodes: HTTP, DB, Email, Slack, GitHub, Linear, Stripe, and 20+ more.",
    tags: ["~3,200 LOC", "73 files", "78 schemas", "plugin registry", "JSON Schema"],
    color: "#A07840",
  },
  {
    icon: "🌐",
    subtitle: "Browser Layer",
    name: "internal/browser/",
    description: "Rod (Chrome DevTools Protocol via WebSocket). Stealth evasion via go-rod/stealth plugin. Humanized input: per-keystroke delays 20–150ms, 5% typo rate with auto-correct. 12+ Chromium flags for anti-detection. Page pool — one page per platform+session, reused to preserve login state.",
    tags: ["~1,500 LOC", "Rod/CDP", "stealth", "humanized", "page pool"],
    color: "#8B7355",
  },
  {
    icon: "🤖",
    subtitle: "Platform Bots",
    name: "internal/bot/",
    description: "Platform-specific DOM navigators and data extractors for Instagram, LinkedIn, X/Twitter, TikTok, Telegram, and Email. Tier-1 in the 3-tier fallback: Go code (reliable, version-locked). Handles K/M number conversion (12.5K→12500), deduplication, and batch SQLite saves.",
    tags: ["~2,800 LOC", "6 platforms", "K/M parse", "dedup", "batch saves"],
    color: "#C8A97E",
  },
  {
    icon: "🗄",
    subtitle: "Storage",
    name: "internal/storage/",
    description: "SQLite via modernc.org/sqlite (pure Go, no CGO). 40+ tables covering workflows, executions, actions, people, lists, templates, threads, credentials, and platform sessions. Execution history pruning via cron (default: keep last 500 per workflow). JSON export for large-scale people data.",
    tags: ["~2,200 LOC", "40+ tables", "pure Go", "no CGO", "JSON export"],
    color: "#B8956A",
  },
  {
    icon: "🔑",
    subtitle: "Auth & Connections",
    name: "internal/connections/",
    description: "OAuth2 manager for 30+ cloud services (Google, GitHub, Linear, Stripe, Salesforce, HubSpot, etc.). Platform session cookies persisted in SQLite, auto-cleanup on expiry. Manual browser login flow captures cookies. Credential vault for API keys and tokens.",
    tags: ["~1,600 LOC", "OAuth2", "30+ services", "session cookies", "vault"],
    color: "#A07840",
  },
  {
    icon: "🧠",
    subtitle: "AI Integration",
    name: "internal/ai/",
    description: "Multi-provider LLM support: Anthropic (Claude Opus/Sonnet/Haiku), OpenAI (GPT-4/3.5), Google Gemini, AWS Bedrock. Prompt caching for Anthropic. Per-workflow chat history for multi-turn conversations. Token usage and cost tracking per provider per execution.",
    tags: ["~1,800 LOC", "Anthropic", "OpenAI", "Gemini", "Bedrock", "prompt cache"],
    color: "#8B7355",
  },
];

const executionFlow = [
  {
    num: "1", color: "#C8A97E",
    title: "Trigger Event",
    body: "User fires monotask run <workflow-id>, clicks Run in Wails UI, a cron schedule fires (robfig/cron), or a webhook HTTP POST hits :9321/webhook/{id}. WorkflowEngine receives the trigger event and creates a WorkflowExecution record with QUEUED status.",
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
    body: "Main loop pops (node, inputItems) from the BFS stack. If disabled, skip. ExpressionEngine.ResolveConfig() evaluates {{$json.*}}, {{$node[\"Name\"].*}}, {{env \"...\"}} in all string config fields. Node is dispatched to registry.Get(nodeType).Execute().",
    code: `// Expression examples:
{{$json.username}}          → current item field
{{$node["Search"].json[0]}} → named node output
{{env "OPENAI_KEY"}}        → environment variable`,
  },
  {
    num: "4", color: "#8B7355",
    title: "Node Execution",
    body: "Each node type handles its logic. Browser action nodes wrap ActionExecutor (loads JSON defs, runs 17 step types). Control nodes implement IF/Switch/Merge/Loop/Wait. Transform nodes (Set, Code) use expression engine. Service nodes (HTTP, Slack, GitHub) make external API calls. AI nodes invoke LLM providers.",
    code: null,
  },
  {
    num: "5", color: "#C8A97E",
    title: "3-Tier DOM Fallback",
    body: "For browser action nodes needing DOM elements: Tier 1 = call_bot_method (Go code, reliable). Tier 2 = XPath alternatives (human-written, brittle but fast). Tier 3 = AI-generated CSS selector via config manager (adaptive but slow). Each tier skippable with onError: skip.",
    code: "call_bot_method → XPath → AI selector (config manager)",
  },
  {
    num: "6", color: "#B8956A",
    title: "Output Routing",
    body: "Node emits outputs on named handles: main, error, true/false (IF), loop_item/done (Loop), or custom handles. Each connected downstream node is pushed onto the BFS stack. MERGE nodes accumulate inputs from multiple branches via sync.Mutex-guarded state map, releasing when all expected inputs arrive.",
    code: "outputs[\"main\"] → push connected nodes onto BFS stack",
  },
  {
    num: "7", color: "#A07840",
    title: "Error Handling",
    body: "Per-node on_error policy: stop (mark execution FAILED, return immediately), continue (treat error as success, pass input through), error_branch (emit on error handle with structured NodeError). Execution history saved to workflow_execution_nodes table for debugging.",
    code: null,
  },
  {
    num: "8", color: "#8B7355",
    title: "Execution Complete",
    body: "Stack empties → COMPLETED. Stop-error node triggers → FAILED. WorkflowExecution record updated with final status, duration, error message. Result returned to caller (CLI prints summary, Wails UI refreshes, webhook HTTP response returned). History pruned to last 500 per workflow via background cron.",
    code: null,
  },
];

const nodeTypes = [
  { category: "Control & Transform", count: 15, examples: ["IF", "Switch", "Merge", "Wait", "Loop", "Set", "Code", "NoOp"], color: "#C8A97E" },
  { category: "Browser & Bots", count: 15, examples: ["Instagram", "LinkedIn", "X/Twitter", "TikTok", "Telegram", "Email", "Chrome"], color: "#B8956A" },
  { category: "Service Integrations", count: 25, examples: ["HTTP Request", "Slack", "GitHub", "Linear", "Stripe", "Salesforce", "HubSpot"], color: "#A07840" },
  { category: "AI Nodes", count: 8, examples: ["Anthropic Chat", "OpenAI Prompt", "Gemini", "Bedrock", "AI Extract"], color: "#8B7355" },
  { category: "Data & Storage", count: 10, examples: ["SQLite Query", "JSON Parse", "CSV Export", "Excel Write", "HTML Extract"], color: "#C8A97E" },
];


const perfStats = [
  { op: "Node dispatch overhead", val: "<1ms", pct: 99, note: "Registry lookup + expression resolve" },
  { op: "Browser action (click)", val: "50–500ms", pct: 60, note: "Includes humanization delays" },
  { op: "DOM extraction (goquery)", val: "<10ms", pct: 95, note: "Per element set" },
  { op: "AI LLM call (Anthropic)", val: "500ms–5s", pct: 30, note: "Network latency dominates" },
  { op: "SQLite batch write", val: "<20ms", pct: 90, note: "Per 100 people rows" },
  { op: "Workflow DAG build", val: "<5ms", pct: 97, note: "Kahn's sort on 100 nodes" },
  { op: "Webhook trigger response", val: "<50ms", pct: 85, note: "Enqueue + HTTP 202 response" },
  { op: "Cron schedule resolution", val: "<1ms", pct: 99, note: "robfig/cron v3 in-process" },
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
            Go 1.25 · Rod CDP · DAG Engine
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>Mono Agent</span>
            <br />Orchestrates Workflows
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            52K+ lines of Go. A DAG workflow engine with 73 node types, Rod browser automation across 6 social platforms, multi-provider AI, and a Wails desktop UI.
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
              <text x="245" y="152" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">Kahn's topological sort · BFS execution stack</text>

              {/* ActionExecutor */}
              <rect x="420" y="95" width="200" height="65" rx="10" fill="rgba(184,149,106,0.1)" stroke="#B8956A" strokeWidth="1.5"/>
              <text x="520" y="118" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">ActionExecutor</text>
              <text x="520" y="135" textAnchor="middle" fill="#B8956A" fontSize="10">17 step types · go:embed</text>
              <text x="520" y="150" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">29 JSON action defs</text>

              {/* ExpressionEngine */}
              <rect x="640" y="95" width="220" height="65" rx="10" fill="rgba(160,120,64,0.1)" stroke="#A07840" strokeWidth="1.5"/>
              <text x="750" y="118" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">ExpressionEngine</text>
              <text x="750" y="135" textAnchor="middle" fill="#A07840" fontSize="10">text/template · FuncMap</text>
              <text x="750" y="150" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">{`{{$json.*}} · {{env "..."}} · {{$node[...]}}`}</text>

              {/* Node Registry row */}
              <rect x="30" y="198" width="130" height="58" rx="9" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2"/>
              <text x="95" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Browser</text>
              <text x="95" y="238" textAnchor="middle" fill="#8B7355" fontSize="9">Rod · CDP</text>
              <text x="95" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">stealth · human</text>

              <rect x="173" y="198" width="130" height="58" rx="9" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.2"/>
              <text x="238" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Bot Layer</text>
              <text x="238" y="238" textAnchor="middle" fill="#C8A97E" fontSize="9">6 Platforms</text>
              <text x="238" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">IG · LI · X · TikTok</text>

              <rect x="316" y="198" width="130" height="58" rx="9" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.2"/>
              <text x="381" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">AI Nodes</text>
              <text x="381" y="238" textAnchor="middle" fill="#A07840" fontSize="9">4 Providers</text>
              <text x="381" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">Claude · GPT · Gemini</text>

              <rect x="459" y="198" width="130" height="58" rx="9" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.2"/>
              <text x="524" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Services</text>
              <text x="524" y="238" textAnchor="middle" fill="#B8956A" fontSize="9">HTTP · Slack · DB</text>
              <text x="524" y="250" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">GitHub · Linear · ...</text>

              <rect x="602" y="198" width="130" height="58" rx="9" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2"/>
              <text x="667" y="221" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">Control</text>
              <text x="667" y="238" textAnchor="middle" fill="#8B7355" fontSize="9">IF · Switch · Loop</text>
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
              <text x="105" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">Chrome (Headless)</text>
              <text x="105" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">Rod DevTools Protocol</text>

              <rect x="200" y="375" width="150" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1"/>
              <text x="275" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">External APIs</text>
              <text x="275" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">Slack · GitHub · Linear · ...</text>

              <rect x="370" y="375" width="150" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1"/>
              <text x="445" y="391" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">AI APIs</text>
              <text x="445" y="407" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">Anthropic · OpenAI · Gemini</text>

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
            52,000+ lines of Go across 251 files. Clean separation between engine, execution, browser, and storage layers.
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
            From trigger to result — 8 steps through the DAG executor, expression engine, and node registry.
          </p>
          <div className="flex flex-col gap-4">
            {executionFlow.map((step) => (
              <div key={step.num} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: step.color }}>{step.num}</div>
                <div className="flex-1">
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
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">73 Node Types</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Every node registers with NodeTypeRegistry → factory function mapping. Each loads its JSON Schema from workflow/schemas/. Plugins can register new types at runtime without recompiling.
          </p>
          <div className="flex flex-col gap-4 mb-8">
            {nodeTypes.map((nt) => (
              <div key={nt.category} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                  style={{ background: nt.color }}>{nt.count}</div>
                <div className="flex-1">
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
                { tier: "Tier 1", label: "call_bot_method", desc: "Go code in bot layer — reliable, version-locked, fastest", conf: "~100% reliable" },
                { tier: "Tier 2", label: "XPath alternatives", desc: "Human-written selectors — faster than AI but brittle if platform changes UI", conf: "~85% reliable" },
                { tier: "Tier 3", label: "AI-generated CSS", desc: "Config manager asks LLM for selector — adaptive but slow (~500ms extra)", conf: "~70% reliable" },
              ].map((t) => (
                <div key={t.tier} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded border" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}0d` }}>{t.tier}</span>
                  <div>
                    <span className="text-xs font-mono font-semibold text-espresso">{t.label}</span>
                    <span className="text-xs text-espresso/50 ml-2">— {t.desc}</span>
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
            All string config fields in every node are resolved through ExpressionEngine before execution. No JavaScript sandbox — pure Go templates with a controlled FuncMap.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 mb-8">
            {[
              { expr: "{{$json.username}}", desc: "Field from the current item (output of previous node)" },
              { expr: '{{$node["Search"].json[0].title}}', desc: "Output of a specific named upstream node" },
              { expr: "{{$workflow.id}}", desc: "Workflow metadata (id, name, created_at)" },
              { expr: "{{$execution.id}}", desc: "Current execution runtime info" },
              { expr: '{{env "OPENAI_KEY"}}', desc: "OS environment variable (secure, not stored in workflow)" },
              { expr: "{{len $json.items}}", desc: "Array length — built-in template function" },
              { expr: "{{now}}", desc: "Current timestamp as Go time.Time" },
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
              <strong className="text-espresso">Go text/template instead of Lua or JavaScript</strong> — no eval sandboxing required. Expressions are limited by the FuncMap (no arbitrary Go access). Simple enough for non-technical users, composable for power users. Go's template engine is battle-tested with zero external runtime overhead.
            </p>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section id="performance" className="px-8 py-20 bg-ivory-warm">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Performance</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Execution Benchmarks</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Go + single-goroutine BFS execution eliminates race conditions. Bottlenecks are always network-bound (browser, AI, APIs) not engine-bound.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-espresso/8 bg-ivory-warm/50">
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40">Operation</th>
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40 w-52">Speed</th>
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40">Notes</th>
                </tr>
              </thead>
              <tbody>
                {perfStats.map((row, i) => (
                  <tr key={row.op} className={i < perfStats.length - 1 ? "border-b border-espresso/6" : ""}>
                    <td className="py-3 px-5 text-sm text-espresso">{row.op}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-espresso/8 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${accent}, #8B6914)` }} />
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: accent }}>{row.val}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-xs text-espresso/45">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Why BFS, Not Goroutines?", body: "Browser actions are seconds-to-minutes. Spawning goroutines per branch adds overhead without benefit. Parallel execution uses the worker pool instead — multiple workflows run concurrently, not multiple branches within one." },
              { title: "Pure Go SQLite", body: "modernc.org/sqlite is a CGO-free port of SQLite. Zero C compilation, single static binary, no system SQLite dependency. Slightly slower than CGO builds (~10%) but enables cross-compilation and Docker-free deployment." },
              { title: "Single Binary", body: "go:embed packages all 29 action JSONs and 78 workflow schemas. No external config files needed. Wails embeds the React UI. The entire system — CLI, Wails app, action engine — ships as one ~50MB executable." },
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
          Mono Agent · Go 1.25 · Rod · Wails · Architecture 2026-04-15 ·{" "}
          <Link href="/projects/mono-agent" className="hover:text-espresso/60 transition-colors">← Back to Mono Agent</Link>
        </p>
      </footer>
    </div>
  );
}
