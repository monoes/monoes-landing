import Link from "next/link";

const accent = "#8B6914";

const stats = [
  { value: "17+", label: "Packages" },
  { value: "22", label: "Hook Events" },
  { value: "230+", label: "Agent Types" },
  { value: "4", label: "Memory Tiers" },
  { value: "53+", label: "CLI Commands" },
];

const components = [
  {
    icon: "⬡",
    subtitle: "Runtime Coordinator",
    name: "hook-handler.cjs",
    description:
      "Central dispatcher handling all 22 hook events. Wires every sub-system. On session-restore alone, it runs 8 sequential phases to construct the full prompt context Claude receives.",
    tags: ["22 hook events", "runWithTimeout", "safeRequire", "session phases"],
    color: "#8B6914",
  },
  {
    icon: "🏛",
    subtitle: "Memory Palace",
    name: "memory.cjs",
    description:
      "Four-tier memory hierarchy (L0–L3) combining BM25 full-text with HNSW vector indexing. Persistent context across sessions via AgentDB backends. Cross-agent namespace sharing through PartitionedHNSW.",
    tags: ["L0–L3 tiers", "BM25 K1=1.5", "HNSW vectors", "AgentDB", "PartitionedHNSW"],
    color: "#8B7355",
  },
  {
    icon: "🧠",
    subtitle: "Neural Learning",
    name: "sona.cjs",
    description:
      "SONA adaptation engine with LoRA fine-tuning (rank 1–16) and EWC++ memory preservation preventing catastrophic forgetting. Six RL algorithms: PPO, DQN, A2C, DecisionTransformer, Q-Learning, SARSA.",
    tags: ["LoRA rank 1–16", "EWC++", "PPO/DQN/A2C", "SARSA", "<0.05ms"],
    color: "#A07840",
  },
  {
    icon: "🔀",
    subtitle: "Agent Router",
    name: "router.cjs",
    description:
      "Multi-tier waterfall routing from natural language to optimal agent across 230+ types. Non-dev detection → regex patterns → semantic RouteLayer → keyword fallback. Writes last-route.json for statusline.",
    tags: ["4-tier waterfall", "230+ agents", "0.85 confidence", "RouteLayer"],
    color: "#B8956A",
  },
  {
    icon: "🗺",
    subtitle: "Knowledge Graph",
    name: "monograph",
    description:
      "SQLite-backed code dependency graph with 30 MCP tools for impact analysis, path finding, and community detection. Queried automatically before every task — no manual invocation needed.",
    tags: ["SQLite", "30 MCP tools", "Louvain communities", "god nodes", "BFD chunking"],
    color: "#C8A97E",
  },
  {
    icon: "💰",
    subtitle: "Cost Tracking",
    name: "token-tracker.cjs",
    description:
      "Full codeburn pipeline port. Parses JSONL sessions, deduplicates subagent chains, calculates API costs with per-model pricing, renders ANSI dashboard with 6 panels. Auto-injected at session-restore.",
    tags: ["JSONL parser", "UTC-safe", "13-category", "ANSI dashboard"],
    color: "#8B6914",
  },
  {
    icon: "🔒",
    subtitle: "Safety Layer",
    name: "pre-bash validation",
    description:
      "Built into hook-handler. Blocks destructive shell patterns before Claude can execute them: rm -rf /, fork bombs, dd zero-fill. Returns {action:\"block\"} to Claude Code which prevents execution.",
    tags: ["rm -rf /", "fork bombs", "dd /dev/zero", "PreToolUse"],
    color: "#8B7355",
  },
  {
    icon: "💾",
    subtitle: "Session State",
    name: "session.cjs",
    description:
      "Manages .monomind/sessions/current.json lifecycle. restore(), end(), and metric() calls track task counts and session duration. Archives on end to session-{id}.json.",
    tags: ["current.json", "archive", "duration", "task counter"],
    color: "#A07840",
  },
];

const flowSteps = [
  {
    num: "1",
    color: "#8B6914",
    title: "Session Restore — Identity Injection",
    body: "On every new conversation, session.restore() loads current.json. Memory Palace injects [MEMORY_PALACE_L0] — the static identity.md containing project name, stack, key packages, git remote, and working style. This is always the first thing Claude reads.",
    code: null,
  },
  {
    num: "2",
    color: "#8B7355",
    title: "Essential Story — Top-5 Scored Drawers",
    body: "From drawers.jsonl, the top-5 entries by score (within last 30 days) are injected as [MEMORY_PALACE_L1]. Score rises on retrieval frequency — frequently-useful memories bubble up automatically. No manual curation needed.",
    code: "score bumped on every recall → high-frequency memories promoted to L1",
  },
  {
    num: "3",
    color: "#B8956A",
    title: "Knowledge Base Preload + Monograph",
    body: "CLAUDE.md + docs/*.md are scanned, chunked, and keyword-indexed. Monograph automatically queries the code dependency graph — relevant files, god nodes, and impact paths are surfaced before Claude starts work.",
    code: null,
  },
  {
    num: "4",
    color: "#A07840",
    title: "Token Cost Awareness",
    body: "token-tracker.quickSummary() parses current month's JSONL session files, aggregates today + monthly spend, and injects as [TOKEN_USAGE]. Claude sees actual API spend before starting work. All timestamps handled in UTC to avoid timezone drift.",
    code: "[TOKEN_USAGE] Today: $17.69 (414 calls) | Month: $2249.47 (39330 calls)",
  },
  {
    num: "5",
    color: "#C8A97E",
    title: "User Prompt Submitted → Route Hook Fires",
    body: "Every UserPromptSubmit triggers the route hook. Intelligence scans auto-memory-store.json for Jaccard-scored relevant past patterns → injected as [INTELLIGENCE]. Router runs its 4-tier waterfall producing the routing panel Claude and the user see in terminal.",
    code: null,
  },
  {
    num: "6",
    color: "#8B6914",
    title: "Task Complexity Scoring → Model Recommendation",
    body: "Pre-task hook scores the task description 0–100 based on word count + keywords. Score <30% → Haiku recommended. Score >70% → Opus recommended. Injected as [TASK_MODEL_RECOMMENDATION]. This informs agent spawning decisions.",
    code: "[TASK_MODEL_RECOMMENDATION] Use model=\"haiku\" (score: 18/100)",
  },
  {
    num: "7",
    color: "#8B7355",
    title: "Response + Post-Task Memory Storage",
    body: "After each task completes, post-task fires. Task content is chunked into 800-char segments (100-char overlap) and stored in drawers.jsonl. Closet terms extracted via regex. KG triple added. Future sessions can recall what was done here.",
    code: "memory.storeVerbatim(cwd, taskContent, {wing:'tasks', room:'active'})",
  },
  {
    num: "8",
    color: "#A07840",
    title: "Session End → Consolidation + Archive",
    body: "session-end triggers intelligence.consolidate() (clears pending-insights.jsonl), session.end() archives current.json, and Memory Palace stores a session-end temporal triple in kg.json with a valid_from timestamp.",
    code: null,
  },
];

const memoryTiers = [
  {
    badge: "L0",
    color: "#8B6914",
    title: "Identity — Always Loaded",
    body: "Static .monomind/palace/identity.md — project name, stack, key packages, working style, git remote. Injected verbatim as [MEMORY_PALACE_L0] on every session. Never auto-overwritten.",
    cost: "Always injected · ~500 chars",
  },
  {
    badge: "L1",
    color: "#8B7355",
    title: "Essential Story — Top-5 Scored Drawers",
    body: "Reads drawers.jsonl, scores entries within last 30 days, picks top-5 by retrieval score. Auto-injected as [MEMORY_PALACE_L1]. Scores rise with every recall — high-frequency memories stay visible.",
    cost: "On session-restore · top-5 by score",
  },
  {
    badge: "L2",
    color: "#B8956A",
    title: "On-Demand Namespace Recall",
    body: "recall(wing, room, limit) retrieves top-scored drawers from a specific namespace. Called explicitly by hook code or agents needing focused context. Wings: tasks, sessions, architecture, debugging, general.",
    cost: "On-demand · namespace-scoped",
  },
  {
    badge: "L3",
    color: "#A07840",
    title: "Deep BM25 + HNSW Full Search",
    body: "search(query, wing?, room?, limit?) runs Okapi BM25 (K1=1.5, B=0.75) across all drawers + HNSW vector indexing for semantic recall. 150×–12,500× faster than naive search. Supports temporal KG queries via kgQuery().",
    cost: "Explicit call only · full corpus · BM25 + HNSW",
  },
];

const routerTiers = [
  {
    num: "TIER 0",
    color: "#8B6914",
    title: "Non-Dev Specialist Detection",
    desc: "If prompt matches marketing · sales · product · UI design · blockchain · legal → routes to \"extras\" with confidence 0.85. Returns top-8 specialist agents immediately. Skips all remaining tiers.",
    conf: "0.85 conf",
  },
  {
    num: "TIER 1",
    color: "#C8A97E",
    title: "Task Pattern Regex Matching",
    desc: "TASK_PATTERNS checked in priority order: implement|create|build → coder (0.8). fix|debug|error → reviewer (0.85). test|spec → tester (0.8). document|explain → researcher (0.75). security|auth → security-architect (0.9).",
    conf: "0.75–0.9",
  },
  {
    num: "TIER 2",
    color: "#8B7355",
    title: "Semantic RouteLayer",
    desc: "TF-IDF weighted keyword matching against agent capability profiles. Computes cosine similarity between prompt token vector and each agent's skill vector. Returns ranked list with similarity scores. Handles nuanced multi-concept prompts.",
    conf: "cosine sim",
  },
  {
    num: "TIER 3",
    color: "#A07840",
    title: "Keyword Fallback",
    desc: "Simple token overlap between prompt and agent descriptions. Last resort — always produces a result. Default confidence 0.5 with \"Default routing\" reason. Prevents routing failure for any input.",
    conf: "0.50 conf",
  },
];

const pipelineSteps = [
  { icon: "📂", title: "JSONL Discovery", desc: "~/.claude/projects/**/*.jsonl recursive scan, including subagent dirs" },
  { icon: "🔍", title: "Parse & Dedup", desc: "Read assistant entries, deduplicate by msg.id across subagent chains" },
  { icon: "🏷", title: "Classify Turn", desc: "13-category classifier: tools first, then keyword patterns" },
  { icon: "💵", title: "Calculate Cost", desc: "multiplier × (in×rate + out×rate + cache reads/writes + webSearch)" },
  { icon: "📊", title: "Render Dashboard", desc: "6 ANSI panels: Overview, Projects, Models, Daily chart, Tools, MCP" },
];

const hooks = [
  { name: "session-restore", desc: "Fires on every conversation start. Runs 8 phases: restore → intelligence → workers → knowledge → instructions → memory palace → tokens → monograph index. Most complex handler." },
  { name: "session-end", desc: "Fires on conversation end. Consolidates insights, archives session JSON, stores temporal KG triple for the session boundary." },
  { name: "route (UserPromptSubmit)", desc: "Every user message. Intelligence context retrieval → semantic routing → MicroAgent scan → prints routing panel → writes last-route.json." },
  { name: "pre-task", desc: "Before task execution. Increments task counter. Scores complexity 0–100 → outputs [TASK_MODEL_RECOMMENDATION] for Haiku/Sonnet/Opus selection." },
  { name: "post-task", desc: "After task completion. Stores task content in Memory Palace (800-char chunks). Extracts closet terms. Saves routing pattern for future intelligence." },
  { name: "pre-edit / post-edit", desc: "pre-edit: reads file, suggests specialist agent. post-edit: records edit to pending-insights.jsonl via intelligence.recordEdit()." },
  { name: "pre-bash (PreToolUse)", desc: "Safety validator. Blocks: rm -rf /, format c:, dd if=/dev/zero, fork bombs. Returns {action:\"block\"} — Claude Code prevents command execution." },
  { name: "load-agent", desc: "Reads .claude/agents/{slug}.md and prints full content — activates an agent's identity and capabilities for the current conversation turn." },
  { name: "notify", desc: "Sends system notifications for important events. Used by workers and the routing system to surface alerts without interrupting the main flow." },
  { name: "worker hooks", desc: "worker-dispatch, worker-status, worker-list, worker-cancel, worker-detect: manage 10 background intelligence workers (security, health, swarm, performance, patterns, learning, git, DDD, ADR, cache)." },
  { name: "intelligence hooks", desc: "trajectory-start/step/end, pattern-store/search, attention, learn, stats: inner workings of the intelligence learning loop. Records edit patterns and trajectories." },
  { name: "transfer", desc: "Handles cross-session context transfer. Packages the current session's learned state for injection into a new conversation." },
];

const perfRows = [
  { op: "L0 Identity injection", component: "memory.cjs", pct: 98, time: "<1ms", note: "Single file read" },
  { op: "L1 Top-5 drawers", component: "memory.cjs", pct: 85, time: "5–15ms", note: "JSONL parse + sort" },
  { op: "L3 HNSW vector search", component: "memory.cjs", pct: 95, time: "<1ms", note: "150×–12,500× vs naive" },
  { op: "L3 BM25 full search", component: "memory.cjs", pct: 65, time: "20–80ms", note: "Per 1000 drawers" },
  { op: "Jaccard context retrieval", component: "intelligence.cjs", pct: 90, time: "<5ms", note: "Per 500 entries" },
  { op: "4-tier routing", component: "router.cjs", pct: 92, time: "<3ms", note: "Sync regex waterfall" },
  { op: "Token quickSummary", component: "token-tracker.cjs", pct: 40, time: "200–500ms", note: "Per month of sessions" },
  { op: "Hook timeout guard", component: "hook-handler.cjs", pct: 100, time: "3s max", note: "runWithTimeout cap" },
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
            {["Overview", "Components", "Flow", "Memory", "Router", "Tokens", "Hooks", "Performance"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
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
            v1.10.54 · Technical Architecture
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>Monomind</span>
            <br />Thinks
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            A self-learning Claude Code orchestration layer. Every interaction intercepted, routed, remembered, and improved. Here&apos;s the full picture.
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
            All components wired through hook-handler.cjs — the central orchestrator that every Claude Code event flows through.
          </p>

          {/* SVG Diagram */}
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg
              viewBox="0 0 900 520"
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
                <marker id="arrow-bronze" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#8B7355" />
                </marker>
                <marker id="arrow-tan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#B8956A" />
                </marker>
                <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#C8A97E" />
                </marker>
              </defs>

              {/* Claude Code top bar */}
              <rect x="50" y="20" width="800" height="60" rx="10" fill="rgba(139,105,20,0.06)" stroke="#8B6914" strokeWidth="1.5" strokeOpacity="0.5" />
              <text x="450" y="45" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">CLAUDE CODE (IDE / CLI)</text>
              <text x="450" y="65" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="11">User submits prompt → Hook events fire (JSON via stdin/stdout) → Engineered response returned</text>

              {/* Arrow down */}
              <line x1="450" y1="80" x2="450" y2="115" stroke="#8B6914" strokeWidth="1.5" markerEnd="url(#arrow-gold)" strokeOpacity="0.7" />
              <text x="465" y="102" fill="rgba(42,35,24,0.4)" fontSize="10">Hook events</text>

              {/* hook-handler.cjs */}
              <rect x="290" y="120" width="320" height="65" rx="12" fill="rgba(139,105,20,0.08)" stroke="#8B6914" strokeWidth="2" />
              <circle cx="320" cy="152" r="18" fill="rgba(139,105,20,0.12)" stroke="#8B6914" strokeWidth="1.5" />
              <text x="320" y="157" textAnchor="middle" fill="#8B6914" fontSize="14">⬡</text>
              <text x="410" y="147" textAnchor="middle" fill="#2A2318" fontSize="13" fontWeight="700">hook-handler.cjs</text>
              <text x="410" y="167" textAnchor="middle" fill="#8B6914" fontSize="10" fontWeight="600">Runtime Coordinator · 22 Hook Events</text>

              {/* Lines from hook-handler */}
              <path d="M 360 185 L 200 240" stroke="rgba(139,115,85,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 420 185 L 420 240" stroke="rgba(184,149,106,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 480 185 L 550 240" stroke="rgba(160,120,64,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
              <path d="M 540 185 L 700 240" stroke="rgba(200,169,126,0.5)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />

              {/* memory.cjs */}
              <rect x="60" y="245" width="220" height="70" rx="10" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.5" />
              <text x="170" y="270" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">memory.cjs</text>
              <text x="170" y="287" textAnchor="middle" fill="#8B7355" fontSize="10" fontWeight="600">4-Tier Memory · BM25 + HNSW</text>
              <text x="170" y="303" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10">drawers.jsonl · AgentDB · PartitionedHNSW</text>

              {/* router.cjs */}
              <rect x="305" y="245" width="220" height="70" rx="10" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.5" />
              <text x="415" y="270" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">router.cjs</text>
              <text x="415" y="287" textAnchor="middle" fill="#B8956A" fontSize="10" fontWeight="600">4-Tier Waterfall · 230+ Agents</text>
              <text x="415" y="303" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10">Skills · RouteLayer · Specialists</text>

              {/* sona.cjs */}
              <rect x="545" y="245" width="200" height="70" rx="10" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.5" />
              <text x="645" y="270" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">sona.cjs</text>
              <text x="645" y="287" textAnchor="middle" fill="#A07840" fontSize="10" fontWeight="600">LoRA · EWC++ · 6 RL Algorithms</text>
              <text x="645" y="303" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10">PPO · DQN · A2C · Q-Learning</text>

              {/* token-tracker.cjs */}
              <rect x="750" y="245" width="115" height="70" rx="10" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.5" />
              <text x="807" y="268" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">token-tracker</text>
              <text x="807" y="283" textAnchor="middle" fill="#C8A97E" fontSize="9" fontWeight="600">.cjs</text>
              <text x="807" y="300" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">JSONL · Cost</text>
              <text x="807" y="311" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">Dashboard</text>

              {/* Downward arrows */}
              <path d="M 170 315 L 170 360" stroke="rgba(139,115,85,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M 415 315 L 415 360" stroke="rgba(184,149,106,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M 645 315 L 645 360" stroke="rgba(160,120,64,0.4)" strokeWidth="1.2" markerEnd="url(#arrow)" />

              {/* Storage boxes */}
              <rect x="60" y="365" width="220" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="170" y="386" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="11" fontWeight="600">.monomind/palace/</text>
              <text x="170" y="402" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="10">drawers · closets · kg.json · identity.md</text>

              <rect x="305" y="365" width="220" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="415" y="386" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="11" fontWeight="600">230+ Agent Types · 110 Skills</text>
              <text x="415" y="402" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="10">Regex · Semantic · Specialist routing</text>

              <rect x="545" y="365" width="200" height="50" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1" />
              <text x="645" y="386" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="11" fontWeight="600">.monomind/neural/</text>
              <text x="645" y="402" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="10">LoRA weights · EWC++ state · RL models</text>

              {/* TS Packages bar */}
              <rect x="60" y="440" width="800" height="55" rx="10" fill="rgba(42,35,24,0.02)" stroke="rgba(42,35,24,0.06)" strokeWidth="1" />
              <text x="450" y="462" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="11" fontWeight="600">TypeScript Packages (17+)</text>
              <text x="450" y="481" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="10">@monomind/cli · @monomind/memory · @monomind/hooks · @monomind/swarm · @monomind/neural · monograph</text>

              {/* Animated dots */}
              <circle r="3" fill="#8B6914" opacity="0.8">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 450 80 L 450 120" />
              </circle>
              <circle r="3" fill="#8B7355" opacity="0.8">
                <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s" path="M 360 185 L 200 245" />
              </circle>
              <circle r="3" fill="#B8956A" opacity="0.8">
                <animateMotion dur="2.5s" repeatCount="indefinite" begin="1s" path="M 420 185 L 420 245" />
              </circle>
              <circle r="3" fill="#A07840" opacity="0.8">
                <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.5s" path="M 480 185 L 550 245" />
              </circle>
              <circle r="3" fill="#C8A97E" opacity="0.8">
                <animateMotion dur="2.5s" repeatCount="indefinite" begin="2s" path="M 540 185 L 700 245" />
              </circle>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Runtime Components ── */}
      <section id="components" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Modules</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Runtime Components</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            17+ TypeScript packages form the running system — each managing a distinct functional domain.
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
                <h3 className="text-sm font-semibold text-espresso mb-2 font-mono">{c.name}</h3>
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

      {/* ── Prompt Flow ── */}
      <section id="flow" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Prompt Engineering</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">How a Prompt Gets Built</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            From raw user input to fully-engineered context — every step that fires before Claude sees your message.
          </p>
          <div className="flex flex-col gap-4">
            {flowSteps.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5"
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: step.color }}
                >
                  {step.num}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-espresso mb-2">{step.title}</h4>
                  <p className="text-sm text-espresso/60 leading-relaxed mb-3">{step.body}</p>
                  {step.code && (
                    <code className="block text-xs bg-ivory-warm border border-espresso/8 rounded-lg px-4 py-2 text-espresso/70 font-mono leading-relaxed">
                      {step.code}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Memory Palace ── */}
      <section id="memory" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Memory</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Memory Palace — 4-Tier Hierarchy</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            BM25 precision + HNSW vector recall. Entirely local and deterministic. Inspired by MemPalace arXiv architecture.
          </p>
          <div className="flex flex-col gap-4 mb-8">
            {memoryTiers.map((tier) => (
              <div
                key={tier.badge}
                className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5 items-start transition-transform duration-200 hover:translate-x-1"
                style={{ borderLeft: `4px solid ${tier.color}` }}
              >
                <div
                  className="text-xl font-black min-w-[40px] text-center"
                  style={{ color: tier.color }}
                >
                  {tier.badge}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-espresso mb-1">{tier.title}</h4>
                  <p className="text-sm text-espresso/60 leading-relaxed mb-3">{tier.body}</p>
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full border"
                    style={{ color: tier.color, borderColor: `${tier.color}40`, background: `${tier.color}08` }}
                  >
                    {tier.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* BM25 formula */}
          <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <p className="text-xs uppercase tracking-label font-semibold text-espresso/40 mb-4">
              BM25 Formula (K1=1.5, B=0.75) + HNSW Vector Index
            </p>
            <div className="bg-ivory-warm border border-espresso/8 rounded-xl px-5 py-4 font-mono text-xs text-espresso/70 leading-loose overflow-x-auto">
              score(d,q) = Σ<sub>t∈q</sub> IDF(t) × (f(t,d) × 2.5) / (f(t,d) + 1.5 × (0.25 + 0.75 × |d|/avgdl))<br />
              IDF(t) = log((N − df(t) + 0.5) / (df(t) + 0.5) + 1)<br />
              <span style={{ color: accent }}>final_score = bm25_score + hnsw_cosine_similarity + Σ closet_boost(term) × 0.5</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Router ── */}
      <section id="router" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Routing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">4-Tier Agent Router</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Every user prompt traverses this waterfall from top to bottom — first match wins across 230+ agent types.
          </p>
          <div className="flex flex-col gap-3">
            {routerTiers.map((tier, i) => (
              <div key={tier.num}>
                <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft grid grid-cols-[auto_1fr_auto] items-center gap-5 hover:border-espresso/20 transition-colors">
                  <span
                    className="text-[10px] font-bold tracking-wider px-2 py-1 rounded border"
                    style={{ color: tier.color, borderColor: `${tier.color}60`, background: `${tier.color}0d` }}
                  >
                    {tier.num}
                  </span>
                  <div>
                    <h5 className="text-sm font-semibold text-espresso mb-1">{tier.title}</h5>
                    <p className="text-xs text-espresso/55 leading-relaxed">{tier.desc}</p>
                  </div>
                  <span className="text-sm font-bold whitespace-nowrap" style={{ color: tier.color }}>
                    {tier.conf}
                  </span>
                </div>
                {i < routerTiers.length - 1 && (
                  <div className="text-center text-espresso/25 text-lg py-1">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Token Tracker ── */}
      <section id="tokens" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Cost Tracking</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Token Tracker Pipeline</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Full codeburn port — parses native Claude Code JSONL sessions, deduplicates subagent chains, calculates real API cost.
          </p>

          {/* Pipeline */}
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden mb-8">
            <div className="flex flex-wrap">
              {pipelineSteps.map((step, i) => (
                <div
                  key={step.title}
                  className="flex-1 min-w-[140px] p-6 text-center relative"
                  style={{ borderRight: i < pipelineSteps.length - 1 ? "1px solid rgba(42,35,24,0.08)" : "none" }}
                >
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <h5 className="text-xs font-bold text-espresso mb-2">{step.title}</h5>
                  <p className="text-[11px] text-espresso/50 leading-relaxed">{step.desc}</p>
                  {i < pipelineSteps.length - 1 && (
                    <span className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-espresso/20 z-10 text-base font-mono bg-white">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cost cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-bold mb-3" style={{ color: accent }}>Cost Formula</p>
              <code className="block text-xs font-mono text-espresso/60 leading-loose">
                cost = multiplier ×<br />
                &nbsp;&nbsp;(inputTokens × in_rate<br />
                &nbsp;&nbsp;+ outputTokens × out_rate<br />
                &nbsp;&nbsp;+ cacheWrite × cw_rate<br />
                &nbsp;&nbsp;+ cacheRead × cr_rate<br />
                &nbsp;&nbsp;+ webSearch × $0.01)
              </code>
            </div>
            <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-bold mb-3" style={{ color: accent }}>Fast Mode Multipliers</p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Opus 4.8 (fast)", mult: "6×", color: "#8B6914" },
                  { name: "Sonnet 4.6", mult: "1×", color: "#A07840" },
                  { name: "Haiku 4.5", mult: "1×", color: "#A07840" },
                  { name: "GPT-4o", mult: "1×", color: "#B8956A" },
                ].map((m) => (
                  <div key={m.name} className="flex justify-between text-xs">
                    <span className="text-espresso/50">{m.name}</span>
                    <span className="font-bold" style={{ color: m.color }}>{m.mult}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-bold mb-3" style={{ color: accent }}>UTC Timezone Rule</p>
              <p className="text-xs text-espresso/55 leading-relaxed">
                JSONL timestamps are UTC ISO strings. Never use{" "}
                <code className="text-red-600 bg-red-50 px-1 rounded">new Date(y,m,d)</code> for date math — it&apos;s local time. Always use{" "}
                <code className="text-green-700 bg-green-50 px-1 rounded">Date.UTC()</code> or{" "}
                <code className="text-green-700 bg-green-50 px-1 rounded">now.toISOString().slice(0,10)</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hooks ── */}
      <section id="hooks" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Hook System</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">22 Hook Events</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Claude Code fires these events at precise lifecycle moments — hook-handler.cjs handles every one.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hooks.map((hook) => (
              <div
                key={hook.name}
                className="rounded-xl border border-espresso/10 bg-white p-5 shadow-soft hover:translate-y-[-2px] hover:border-espresso/20 transition-all duration-200"
              >
                <p className="text-xs font-bold font-mono mb-2" style={{ color: accent }}>{hook.name}</p>
                <p className="text-xs text-espresso/60 leading-relaxed">{hook.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Performance ── */}
      <section id="performance" className="px-8 py-20 bg-ivory-warm">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Performance</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Speed &amp; Scale</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            All numbers measured on macOS, Node.js 20, SSD-backed filesystem.
          </p>

          {/* Performance table */}
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-espresso/8 bg-ivory-warm/50">
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40">Operation</th>
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40">Component</th>
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40 w-48">Speed</th>
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40">Note</th>
                </tr>
              </thead>
              <tbody>
                {perfRows.map((row, i) => (
                  <tr key={row.op} className={i < perfRows.length - 1 ? "border-b border-espresso/6" : ""}>
                    <td className="py-3 px-5 text-sm text-espresso">{row.op}</td>
                    <td className="py-3 px-5 text-xs font-mono" style={{ color: accent }}>{row.component}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-espresso/8 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${accent}, #C8A97E)` }}
                          />
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: accent }}>{row.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-xs text-espresso/45">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model tier table */}
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden">
            <div className="px-5 py-3 border-b border-espresso/8 bg-ivory-warm/50">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40">ADR-026 — 3-Tier Model Routing</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-espresso/8">
              {[
                { tier: "TIER 1", color: "#A07840", name: "Agent Booster", sub: "WASM · <1ms · $0", desc: "Simple transforms — no LLM needed. Var→const, type additions." },
                { tier: "TIER 2", color: "#B8956A", name: "Haiku 4.5", sub: "~500ms · $0.0002/req", desc: "Simple tasks, complexity score <30%. Most routine work." },
                { tier: "TIER 3", color: "#8B6914", name: "Sonnet / Opus 4.8", sub: "2–5s · $0.003–0.015", desc: "Architecture, security, complex reasoning. Score >30%." },
              ].map((t) => (
                <div key={t.tier} className="p-6">
                  <p className="text-[10px] uppercase tracking-label font-bold mb-2" style={{ color: t.color }}>{t.tier}</p>
                  <p className="text-base font-semibold text-espresso mb-1">{t.name}</p>
                  <p className="text-xs text-espresso/45 mb-2">{t.sub}</p>
                  <p className="text-xs text-espresso/55 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          Monomind v1.10.54 · Architecture · 2026-05-29 ·{" "}
          <Link href="/projects/monomind" className="hover:text-espresso/60 transition-colors">
            ← Back to Monomind
          </Link>
        </p>
      </footer>
    </div>
  );
}
