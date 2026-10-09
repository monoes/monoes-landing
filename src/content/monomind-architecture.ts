export const ARCH_VERSION = "2.24.3";
export const ARCH_DATE = "2026-10-09";

export const meta = {
  title: "Monomind Architecture",
  description:
    "Technical architecture of Monomind v2.24: 9 packages, 38 CLI commands, 19 agent runners, an SDK-backed org runtime and a local code knowledge graph. Every number checked against the source.",
  ogTitle: "Monomind Architecture: 9 packages, 19 agent runners",
  ogDescription: "How Monomind is actually built: packages, memory, picking, hooks, runtimes, org runtime and security.",
};

export const stats = [
  { value: "9", label: "Packages" },
  { value: "38", label: "CLI Commands" },
  { value: "39", label: "Org Subcommands" },
  { value: "19", label: "Agent Runners" },
  { value: "198", label: "MCP Tools (full)" },
];

export interface Component {
  icon: string;
  subtitle: string;
  name: string;
  path: string;
  description: string;
  tags: string[];
  color: string;
}

export const components: Component[] = [
  {
    icon: "⌨",
    subtitle: "CLI Entry Point",
    name: "@monoes/monomindcli",
    path: "packages/@monomind/cli/",
    description:
      "The published CLI engine, installed through the `monomind` umbrella. 38 top-level commands, the MCP server, `init`, `doctor`, the org runtime and the local dashboard. Its stdio JSON-RPC loop is hand-rolled, so the default transport needs no separate MCP process.",
    tags: ["38 commands", "stdio JSON-RPC", "org runtime"],
    color: "#8B6914",
  },
  {
    icon: "🪝",
    subtitle: "Hooks & Workers",
    name: "@monoes/hooks",
    path: "packages/@monomind/hooks/",
    description:
      "Typed HookEvent registry and executor plus a WorkerManager for 9 on-demand workers. Claude Code reaches it through the `.claude/helpers` handlers; if the package is not built, the hook quietly does nothing.",
    tags: ["20 HookEvent types", "9 workers", "registry + executor"],
    color: "#8B7355",
  },
  {
    icon: "🔌",
    subtitle: "MCP Framework",
    name: "@monoes/mcp",
    path: "packages/@monomind/mcp/",
    description:
      "Standalone MCP framework for the http and websocket transports, with a connection pool and tool registry. It is an optional peer: the default stdio server inside the CLI does not need it.",
    tags: ["http / websocket", "tool registry", "optional peer"],
    color: "#B8956A",
  },
  {
    icon: "💾",
    subtitle: "Memory Backend",
    name: "@monoes/memory",
    path: "packages/@monomind/memory/",
    description:
      "SQLite memory store (better-sqlite3, sql.js WASM fallback) with embeddings, a pure-JS HNSW index and the JSON pattern store. The CLI's memory bridge calls it. LanceDB was removed in v2.3.1, dropping about 600 MB of native dependencies.",
    tags: ["SQLite", "local embeddings", "HNSW at scale"],
    color: "#A07840",
  },
  {
    icon: "🗺",
    subtitle: "Knowledge Graph",
    name: "@monoes/monograph",
    path: "packages/@monomind/monograph/",
    description:
      "Tree-sitter and SQLite code graph in `.monomind/monograph.db`. 14 grammar modules cover 25 file extensions, 5 regex extractors cover Scala, Lua, Zig, PowerShell and Elixir. FTS5 search, Louvain communities and incremental builds. 19 default tools, 27 more behind MONOGRAPH_MCP_ADVANCED=1.",
    tags: ["14 grammars", "46 tools", "graph-neighbour rerank"],
    color: "#C8A97E",
  },
  {
    icon: "🔀",
    subtitle: "Legacy Routing",
    name: "@monoes/routing",
    path: "packages/@monomind/routing/",
    description:
      "The older semantic RouteLayer behind `route semantic`, now deprecated in favour of `pick`. Jev picker, keyword rules, embeddings in an isolated worker, then a Haiku fallback.",
    tags: ["deprecated", "out-of-process embeddings"],
    color: "#8B6914",
  },
  {
    icon: "🌐",
    subtitle: "Browser Automation",
    name: "@monoes/monobrowse",
    path: "packages/@monoes/monobrowse/",
    description:
      "Chrome DevTools Protocol client with no Playwright, Puppeteer or Selenium dependency. Powers `monomind browse` and the agent-browser-testing workflow.",
    tags: ["native CDP", "no external binary"],
    color: "#8B7355",
  },
  {
    icon: "🎨",
    subtitle: "Design Intelligence",
    name: "@monoes/monodesign",
    path: "packages/@monoes/monodesign/",
    description:
      "Design tokens, antipattern detection and the monodesign skill, exposed over MCP as monodesign_detect, monodesign_fix and monodesign_palette.",
    tags: ["design tokens", "antipattern detection"],
    color: "#B8956A",
  },
  {
    icon: "🛡",
    subtitle: "Manipulation Defense",
    name: "monofence-ai",
    path: "packages/monofence-ai/",
    description:
      "Local defense against prompt manipulation: an input cap, an evasion normaliser, 50+ patterns across 9 threat categories, multi-turn escalation tracking and an output scanner. Loads on first use from ~/.monomind/deps, pinned and hash-checked.",
    tags: ["local", "pinned + hash-checked", "output scanner"],
    color: "#A07840",
  },
];

export interface Fact {
  badge: string;
  color: string;
  title: string;
  body: string;
}

export const memoryFacts: Fact[] = [
  {
    badge: "01",
    color: "#8B6914",
    title: "A local SQLite store, not a cloud vector DB",
    body: "better-sqlite3 is primary, sql.js WASM is the fallback. The file is `memory.db` under ~/.monomind/projects/<name>-<hash>/ (the folder keeps its old lancedb name for path compatibility). Embeddings run locally with gte-modernbert-base (768 dimensions, about 90 MB, downloaded once). LanceDB was removed in v2.3.1.",
  },
  {
    badge: "02",
    color: "#8B7355",
    title: "The Second Brain lives in the same store",
    body: "Document chunks are rows in `knowledge:<scope>` namespaces: 22 file types, chunked at 3,200 characters with 400 overlap, deduplicated by SHA-256. `knowledge_search` fuses chunks, the knowledge graph, rules and memory with reciprocal-rank fusion over dense and BM25 retrieval. A personal global brain at ~/.monomind/global-brain is merged into every search.",
  },
  {
    badge: "03",
    color: "#B8956A",
    title: "A memory knowledge graph on top",
    body: "`memory_kg_ingest`, `memory_kg_search`, `memory_kg_stats` and `memory_kg_rollback` keep entities and relations in the same database, and `memory_feedback` records whether a recalled item helped. Ingesting a document does not add it to the graph.",
  },
  {
    badge: "04",
    color: "#A07840",
    title: "HNSW only kicks in at scale",
    body: "Search is brute-force cosine similarity below 100,000 embedded entries (`MONOMIND_HNSW_THRESHOLD`). Above that an HNSW index builds automatically, is cached next to the SQLite file and is reused until entries change. `--build-hnsw` forces an early build.",
  },
  {
    badge: "05",
    color: "#8B6914",
    title: "JSON files still feed hooks and episodes",
    body: "Hook learning keeps `auto-memory-store.json` (capped at 200 entries) and `episodic/episodes.jsonl` for episodic recall. These are separate from the SQLite store, so the word memory covers SQLite, the memory graph, these JSON files and Monograph.",
  },
];

export const routingSteps = [
  {
    num: "1",
    color: "#8B6914",
    title: "`monomind pick` ranks agents and skills",
    body: "One index of 83 agents, 82 skills and 560 Org skills, scored with BM25 keyword ranking and an optional Jev decision model. History can re-rank near-ties by at most 15 percent; nothing is learned by reinforcement.",
  },
  {
    num: "2",
    color: "#B8956A",
    title: "The prompt hook injects a [PICK] line",
    body: "The best-fit agent and skill land in the model's context before it answers. The `pick` MCP tool returns the same ranking on request, and `org_skill_show` loads an Org skill.",
  },
  {
    num: "3",
    color: "#A07840",
    title: "Bare `monomind route \"task\"` runs pick",
    body: "The old keyword-only stub is gone. `route` and `route task` now print the output of `monomind pick --agents`.",
  },
  {
    num: "4",
    color: "#8B7355",
    title: "The semantic RouteLayer is deprecated",
    body: "`route semantic`, `hooks_route_semantic` and `agent spawn --task` still run Jev, 24 regex rules, keyword ranking, embeddings in an isolated worker (Snowflake arctic-embed-xs, about 88 MB, downloaded only on request, with a hash-encoder fallback) and then a Haiku call. Outcomes go to route-outcomes.jsonl, read by `route stats` and `doctor -c pick`.",
  },
];

export const hookGroups = [
  {
    title: "28 `hooks` CLI subcommands",
    items: [
      "pre-edit / post-edit, pre-command / post-command, pre-task / post-task",
      "session-end, session-restore, notify (session-start is deprecated)",
      "route (through the keyword picker), explain, pretrain, transfer, metrics",
      "intelligence (train, patterns, predict, optimize, export, import)",
      "worker, statusline, list, coverage-route, coverage-suggest, coverage-gaps",
      "model-route, model-outcome, model-stats; pre-bash and post-bash are aliases",
    ],
  },
  {
    title: "20 typed HookEvent values",
    items: [
      "A lower-level mechanism in @monoes/hooks: PreToolUse, PostToolUse, PreEdit, PostEdit, PreRead, PostRead, PreCommand, PostCommand, PreTask, PostTask, TaskProgress, SessionStart, SessionEnd, SessionRestore, AgentSpawn, AgentTerminate, PreRoute, PostRoute, PatternLearned, PatternConsolidated.",
      "These are registry event types, not CLI subcommand names. The live .claude/helpers path bridges into this package.",
    ],
  },
  {
    title: "9 on-demand workers",
    items: [
      "health · ddd · security · cache · progress · map · audit · consolidate · reflexion",
      "They run at session start and refresh when their output is missing or older than 6 hours.",
    ],
  },
  {
    title: "How hooks reach each tool",
    items: [
      "Claude Code: settings.json drives `.claude/helpers/hook-handler.cjs`, which dispatches to handlers (pick, router, session, memory, intelligence) and lazily imports @monoes/hooks.",
      "OpenCode: `.opencode/plugins/monomind-hooks.ts` runs the pre-bash and pre-write gates in `tool.execute.before`.",
      "Kimi Code: `plugin/hooks/monomind-gate.mjs` bridges the PreToolUse event to the same gates.",
    ],
  },
];

export const platforms = [
  { name: "Claude Code", writes: ".claude/ (helpers, settings, skills), .mcp.json, CLAUDE.md" },
  { name: "Antigravity (agy)", writes: "GEMINI.md, .gemini/rules/monomind.md, .gemini/settings.json, a .gemini/helpers mirror and a statusline" },
  { name: "OpenCode", writes: "opencode.json, .opencode/{agent,command,skills,plugins}, a /monomind-status command, AGENTS.md" },
  { name: "Kimi Code", writes: ".kimi-code/{mcp.json,agents,skills}, a plugin with commands and the gate hook, AGENTS.md" },
  { name: "Codex", writes: ".codex/config.toml (loaded for trusted projects only), AGENTS.md, .agents/skills/" },
];

export const runtimeFacts = [
  {
    label: "Init targets",
    value: "5 coding tools",
    desc: "`monomind init` detects Claude Code, Antigravity, OpenCode, Kimi Code and Codex on your machine and sets up only those. MCP entries are pinned to the installed version.",
  },
  {
    label: "Org role runners",
    value: "19 runners",
    desc: "Claude and the Vercel AI SDK run in-process. The other 17 are subprocess CLIs: Codex, agy, Kimi Code, OpenCode, Grok, Qwen, Crush, Copilot, Pi, Hermes, Cline, Aider, DSH, Kilo and Freebuff.",
  },
  {
    label: "Mixed teams",
    value: "Per-role runtime",
    desc: "A role's `runtime` beats the org's `runtime`, which beats MONOMIND_RUNTIME, so one org can mix Claude, Codex and local models.",
  },
  {
    label: "Agent exec protocol",
    value: "v1, rev 29",
    desc: "Capability handshake, NDJSON events, `--access scoped|read|full`, `--sandbox` modes, `--effort off..max`, `--resume`, `--budget-usd`. Unknown cost is null, not 0.",
  },
];

export const runtimeCaveats = [
  "Kilo is full-access only and Freebuff is a discovery stub with no headless transport. Both are refused in sections orgs.",
  "Runtimes other than Claude and Vercel receive org tools as text and are capped at 10 tool rounds per message by default.",
  "Codex, agy, Kimi Code, Vercel, Hermes, Qwen and DSH do not report cost, so `budget_usd` cannot close those roles.",
];

export const orgFacts = [
  { label: "Runtime", value: "SDK-backed daemon", desc: "monomind org run/serve. Claude roles are live in-process Agent SDK sessions; other runtimes run as subprocess CLIs." },
  { label: "Subcommands", value: "39", desc: "run, stop, pause, resume, reload, status, serve, logs, events, costs, inbox, approvals, gates, replay, branch, decisions, create, validate, sign, role and more." },
  { label: "Inter-agent channel", value: "org_send / mailbox", desc: "Roles message each other with `org:role` addresses. `ask_human` queues a question, and org_recall, org_remember and org_learn keep cross-run memory." },
  { label: "Tasks", value: "Dependency DAG", desc: "org_task, org_plan_graph and org_task_done. Ready tasks dispatch on their own, summaries are capped, and typed briefs and context packets are opt-in." },
  { label: "Config", value: ".monomind/orgs/<name>.json", desc: "A zod schema: goal, schedule, run_config (1M token budget, 4 concurrent agents, verify_writes and lead_watch on by default) and per-role policy. Sections and documents are generally available." },
  { label: "Signed definitions", value: "org sign", desc: "The operator HMAC-signs a definition and it is checked on run, serve, resume and reload. The key lives outside every role's sandbox, and an unsigned change is refused." },
  { label: "Checks and audit", value: "One checklist", desc: "validate, run, reload, create and the dashboard share the same caveat checks. Skipped scheduled ticks are written to schedule-audit.jsonl." },
  { label: "Dashboard", value: "monomind ui", desc: "Now, Sessions, Projects, Orgs, Monograph and Documents tabs on 127.0.0.1:4242, behind a token. Loopback only." },
];

export const securityFacts: Fact[] = [
  {
    badge: "01",
    color: "#8B6914",
    title: "The scanner is local, and its gate fails open",
    body: "monofence-ai sends no user data anywhere. In Claude Code the deterministic destructive-command and secrets gates fail closed, but the monofence layer fails open when the package is missing, slow or errors, so it is a safety net, not a guarantee. `MONOMIND_MONOFENCE_GATE=off` disables it.",
  },
  {
    badge: "02",
    color: "#8B7355",
    title: "Coder mode is full access, and it says so",
    body: "`--access full` is human-CLI-only, refuses root, needs an explicit --cwd and writes an audit line per turn. The docs state the limits: full access is not a sandbox, fetched web content is not filtered, and background jobs can outlive a stop.",
  },
  {
    badge: "03",
    color: "#B8956A",
    title: "Org sandboxes are opt-in and fail closed",
    body: "`policy.sandbox` can deny a role exec (`denyExec`), reads (`denyRead`) and writes to $HOME (`homeWriteAllow`) inside a bubblewrap layer that fails closed without bubblewrap. Claude roles also get a hard `budget_usd` stop. A plain `agent exec` is not sandboxed by default.",
  },
  {
    badge: "04",
    color: "#A07840",
    title: "What stays local, and what does not",
    body: "Memory, the code graph, the document index and org state stay on your machine. The AI tools Monomind drives send prompts and code, including recalled memory, to their model providers. Monomind's own calls are the embedding download, first-use installs of the Claude SDK and Chrome, update checks and dashboard CDNs. `MONOMIND_NO_AUTO_INSTALL=1` stops the installs.",
  },
  {
    badge: "05",
    color: "#8B6914",
    title: "Local models for org roles, not fully offline",
    body: "Ollama, llama.cpp and LM Studio work for org roles through an OpenAI-compatible endpoint. That is not the same as fully offline: embeddings need a one-time download, the Claude SDK installs on first use, tool calling is weaker on small models and cost shows as $0.",
  },
];

export const honestNotes = [
  "Monoswarm and autopilot were removed in v2.22.0, including the swarm topologies and vote counting. No consensus feature remains. Coordination is Claude Code's Task tool or `monomind org run`.",
  "The semantic RouteLayer is deprecated and bare `monomind route` now runs `pick`. New routing work goes through the picker.",
  "HNSW is automatic above 100,000 embedded entries, not before. Below that, search is brute-force cosine similarity.",
  "The former @monomind/security package was deleted. Input validation lives in packages/@monomind/cli/src/utils/input-guards.ts, and manipulation scanning lives in monofence-ai.",
  "The monofence layer of the pre-bash and pre-write gates fails open on purpose. The deterministic gates are the ones that fail closed.",
  "Full access (`--access full`) is not a sandbox, and a signing key can be read by a role that has no sandbox and no bubblewrap mask.",
  "We cite the pattern count (50+ across 9 categories) as the docs state it. We have not independently counted individual rules.",
];
