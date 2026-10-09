export const ARCH_VERSION = "0.126";
export const ARCH_DATE = "2026-10-09";

export const meta = {
  title: "Mono Agent Architecture",
  description:
    "Technical architecture of Mono Agent v0.126: a local-first workflow engine in one Go binary with 168 node types, your own Chrome as the browser, AI on your installed agent CLIs, and a durable human-in-the-loop queue.",
  ogTitle: "Mono Agent Architecture: 168 node types, one Go binary",
  ogDescription: "How Mono Agent is actually built: engine, nodes, browser bridge, AI runtimes, storage and security.",
};

export const heroStats = [
  { value: "168", label: "Node Types" },
  { value: "45", label: "Top-level Commands" },
  { value: "244K", label: "Lines of Go" },
  { value: "60+", label: "DB Tables" },
  { value: "31", label: "MCP Tools (read-only)" },
  { value: "0", label: "Telemetry" },
];

export interface Module {
  icon: string;
  subtitle: string;
  name: string;
  description: string;
  tags: string[];
  color: string;
}

export const modules: Module[] = [
  {
    icon: "⚡",
    subtitle: "Workflow Engine",
    name: "internal/workflow/",
    description:
      "DAG execution with Kahn-style topological sorting and cycle rejection on construction. An execution queue (capacity 1,000), a worker limit (default 3, capped at 20), cron triggers via robfig/cron v3, webhooks, pause and resume state, and an hourly history pruner.",
    tags: ["DAG", "queue 1,000", "cron + webhook", "resume state"],
    color: "#C8A97E",
  },
  {
    icon: "🧩",
    subtitle: "Node Registry",
    name: "internal/nodes/ + noderegistry/",
    description:
      "168 node types registered through a type-to-factory registry, each with an embedded JSON schema (136 schema files). Browser and social nodes register from action definitions. There is no Go plugin loader; new automations arrive as library packages.",
    tags: ["168 types", "136 schemas", "registry + aliases"],
    color: "#A07840",
  },
  {
    icon: "🎬",
    subtitle: "Action Executor",
    name: "internal/action/",
    description:
      "Runs declarative automations step by step, with about 38 step types covering flow control, browser actions, extraction and bridge scripts. Social automations are official packages from monoes.me, installed with `library install automation <id>`. An opt-in Jev picker backs the three-tier selector fallback.",
    tags: ["~38 step types", "library packages", "3-tier fallback"],
    color: "#B8956A",
  },
  {
    icon: "🌐",
    subtitle: "Browser Bridge",
    name: "internal/browser/ + chrome-extension/",
    description:
      "The CLI drives your own logged-in Chrome through the bundled MonoAgent Bridge extension over a loopback WebSocket on 127.0.0.1:9222, guarded by a shared secret. There is no headless fallback. Rod survives only as a page-API wrapper and for PDF rendering.",
    tags: ["your own Chrome", "extension bridge", "no headless fallback"],
    color: "#8B7355",
  },
  {
    icon: "🧠",
    subtitle: "AI and Orgs",
    name: "internal/monomind/ + dynorg/ + org*/",
    description:
      "No built-in LLM provider and no stored text-AI keys. Every AI step is one turn run by the monomind runner on an agent CLI you already have installed and signed in to. The same layer runs orgs, dynamic coder orgs and org chat.",
    tags: ["agent runtimes", "monomind runner", "org chat"],
    color: "#C8A97E",
  },
  {
    icon: "🗄",
    subtitle: "Storage and Secrets",
    name: "internal/storage/ + secrets/",
    description:
      "SQLite through modernc.org/sqlite (pure Go, no CGO) at ~/.monoagent/monoagent.db, with 61 migrations and about 66 live tables. Secrets use AES-256-GCM with per-profile data keys, wrapped by a key held in the OS keyring.",
    tags: ["pure Go", "61 migrations", "AES-256-GCM", "OS keyring"],
    color: "#B8956A",
  },
  {
    icon: "🔌",
    subtitle: "API Surface",
    name: "internal/mcp/ + httpapi/ + openaiapi/",
    description:
      "An MCP server over stdio (31 read-only tools, 66 with mutations allowed), a REST server on 127.0.0.1:9322 with an OpenAPI spec, and an OpenAI-compatible /v1 gateway over your installed agent runtimes.",
    tags: ["MCP", "REST + OpenAPI", "OpenAI-compatible"],
    color: "#A07840",
  },
  {
    icon: "🖥",
    subtitle: "Desktop App",
    name: "wails-app/",
    description:
      "A Wails v2 desktop app with a React 19 front end, in English and Spanish. Pages cover the dashboard, tasks, publication history, people, applications, communications, documents, orgs, vault, logs and settings.",
    tags: ["Wails v2", "React 19", "en + es"],
    color: "#8B7355",
  },
  {
    icon: "📋",
    subtitle: "Tasks, Library, Account",
    name: "internal/tasks/ + library/ + account/",
    description:
      "A per-profile task board with leases for AI agents, the monoes.me library for workflows, orgs and automations, and an account sign-in that is currently dormant: nothing is enforced for local work.",
    tags: ["5-column board", "library", "account (dormant)"],
    color: "#C8A97E",
  },
];

export interface Step {
  num: string;
  color: string;
  title: string;
  body: string;
  code: string | null;
}

export const executionFlow: Step[] = [
  {
    num: "1",
    color: "#C8A97E",
    title: "Trigger",
    body: "A run starts from the CLI, the desktop app, an MCP tool or the HTTP API, from a cron schedule, or from a webhook on 127.0.0.1:9321/webhook/<path>. Scheduled and webhook triggers only fire while `monoagentcli daemon` is running. `workflow run --input` passes trigger data.",
    code: null,
  },
  {
    num: "2",
    color: "#B8956A",
    title: "Queue and DAG",
    body: "The request enters the execution queue (capacity 1,000) and a worker picks it up; the engine runs 3 at once by default and never more than 20. The workflow graph is loaded, sorted topologically by in-degree, and a cycle is rejected when the DAG is built. `workflow validate` runs these checks without saving or running anything.",
    code: "monoagentcli workflow validate <id>",
  },
  {
    num: "3",
    color: "#A07840",
    title: "Sequential execution loop",
    body: "Nodes run in topological order on a single goroutine per execution. There is no parallel branch fan-out, and merge nodes are driven by waiting counters in that loop. A disabled node is skipped.",
    code: null,
  },
  {
    num: "4",
    color: "#8B7355",
    title: "Expressions",
    body: "String config fields go through text/template with a function map. `$json` is the current item, `$node[\"Name\"].json.field` reads a named node's first output item, and `$workflow.id` and `$execution.id` are available. `$env.VAR` resolves to empty unless MONOAGENT_ALLOW_ENV_TEMPLATES=1.",
    code: `{{$json.username}}
{{$node["Search"].json.title}}
{{upper $json.name}} {{default "n/a" $json.email}}`,
  },
  {
    num: "5",
    color: "#C8A97E",
    title: "Node execution",
    body: "The registry resolves the node type. Browser and social nodes run an action definition through the extension bridge, with three selector tiers: Go bot code, XPath alternatives, then an opt-in Jev element picker. The old `ai.*` nodes are deprecated stubs that fail with a hint to use `agent.ask` or `ai.choose`.",
    code: null,
  },
  {
    num: "6",
    color: "#B8956A",
    title: "Human-in-the-loop",
    body: "`core.human_in_loop` pauses each incoming item into a durable SQLite queue that survives restarts, and the run shows WAITING. Approve or reject from the CLI, the desktop app, MCP or the HTTP API. You can mark fields editable, set a timeout (expiry counts as a rejection), and the node releases its worker slot while it waits.",
    code: "monoagentcli hil list | approve | reject",
  },
  {
    num: "7",
    color: "#A07840",
    title: "Errors",
    body: "Each node has an `on_error` policy: stop, continue, skip, or an error branch. A run with non-fatal failures finishes as SUCCESS_WITH_ERRORS. Per-node outputs are saved in workflow_execution_nodes, and executions are pruned to the last 500 per workflow hourly. WAITING executions are never pruned.",
    code: null,
  },
  {
    num: "8",
    color: "#8B7355",
    title: "Resume and recovery",
    body: "Paused executions persist their resume state. The engine runs resume, stale-reap and webhook-retry loops, and `workflow cancel` and retry are available from the CLI.",
    code: null,
  },
];

export const nodeGroups = [
  { category: "Social platforms", count: 60, examples: ["Instagram 18", "TikTok 16", "LinkedIn 12", "X 7", "Hacker News 4", "Product Hunt 3"], color: "#B8956A" },
  { category: "Services and messaging", count: 36, examples: ["GitHub", "Google Sheets", "Gmail", "Airtable", "Asana", "Slack", "Outlook", "Reddit", "Mastodon"], color: "#A07840" },
  { category: "Data, images and files", count: 17, examples: ["spreadsheet", "markdown", "html", "xml", "crypto", "resize", "crop", "remove_background"], color: "#C8A97E" },
  { category: "AI and agents", count: 15, examples: ["agent.ask", "ai.choose", "gemini generate_image", "browser.jev", "read_page"], color: "#8B7355" },
  { category: "Core and control", count: 15, examples: ["if", "switch", "merge", "filter", "limit", "code", "human_in_loop"], color: "#C8A97E" },
  { category: "Orgs, people and records", count: 14, examples: ["org.run", "org.ask", "people", "applications", "publication.register", "documents.render"], color: "#B8956A" },
  { category: "Databases, HTTP and systems", count: 11, examples: ["Postgres", "MySQL", "MongoDB", "Redis", "HTTP request", "SSH", "execute_command", "vault"], color: "#A07840" },
];

export interface Fact {
  badge: string;
  color: string;
  title: string;
  body: string;
}

export const browserFacts: Fact[] = [
  {
    badge: "01",
    color: "#8B7355",
    title: "Your own Chrome, through an extension bridge",
    body: "`HybridSessionProvider` gets pages only through the MonoAgent Bridge extension. The bridge is a loopback WebSocket on 127.0.0.1:9222 and the first frame must carry a shared secret stored at ~/.monoagent/extension.token. `extension pair` sets it up and `extension reset` revokes it. If the extension is not connected, a page request fails, because there is no headless fallback.",
  },
  {
    badge: "02",
    color: "#B8956A",
    title: "One Chrome profile per Mono Agent profile",
    body: "Each Chrome profile with the extension connects separately and is bound to a Mono Agent profile, so different profiles run their automations in parallel on their own logged-in sessions. The extension asks for per-site host permissions on demand instead of holding all URLs.",
  },
  {
    badge: "03",
    color: "#A07840",
    title: "Human pacing, no stealth layer",
    body: "Typing is character by character with 50 to 250 ms between keys and a 1 to 3 second pause afterwards. The code says no typing mistakes are simulated. The old go-rod stealth package and anti-detection flags are gone, since the browser is your real one.",
  },
  {
    badge: "04",
    color: "#8B7355",
    title: "The extension also feeds the task board",
    body: "Extension 1.6.0 adds tasks to the board: right-click Add selection as task or Add page as task, an Add a task box in the side panel, and a keyboard shortcut. Tasks wait in the extension while Mono Agent is not running. A CDP proxy relays Chrome debugger commands over the same bridge.",
  },
];

export const aiFacts: Fact[] = [
  {
    badge: "01",
    color: "#C8A97E",
    title: "No built-in provider, no stored text-AI keys",
    body: "Every AI step is one turn run by the separate monomind runner on an agent CLI you already have installed and logged in. Detected runtimes include claude, codex, opencode, antigravity, grok, crush, copilot, pi and hermes. A runtime must pass `agent validate` before use, and automatic re-validation is off until you turn it on.",
  },
  {
    badge: "02",
    color: "#B8956A",
    title: "Deprecated nodes fail loudly",
    body: "`ai.chat`, `ai.extract`, `ai.classify`, `ai.transform`, `ai.agent`, `ai.embed` and `service.openrouter` remain registered as stubs that error with a migration hint. Use `agent.ask` or `ai.choose`. `ai.embed` has no replacement.",
  },
  {
    badge: "03",
    color: "#A07840",
    title: "Images and decisions",
    body: "`gemini.generate_image` drives Gemini in your own browser session, with no API key, and the bundled `gemimg` templates wrap it. Jev makes typed decisions such as classification and element picking with its own key, and never writes text.",
  },
  {
    badge: "04",
    color: "#8B7355",
    title: "An OpenAI-compatible gateway over your runtimes",
    body: "`httpapi` and `daemon` serve /v1/models, /v1/chat/completions (streaming and tool calling) and /v1/images/generations over the installed runtimes, with per-profile API keys stored as SHA-256 hashes and an `auto` model where Jev picks. The changelog still lists this work as unreleased.",
  },
  {
    badge: "05",
    color: "#C8A97E",
    title: "Coder mode is off by default",
    body: "Full-access coder chats stay disabled until `coder enable --yes-i-understand`. Dynamic orgs can give each writing worker its own git worktree and branch, and workers can ask you a question through an ask_user tool.",
  },
];

export const surfaceFacts = [
  { label: "CLI", value: "45 top-level commands", desc: "442 command nodes, 378 of them leaves. `workflow`, `node`, `org`, `agent`, `task`, `people`, `library`, `daemon`, `mcp` and `ref`, a built-in offline reference." },
  { label: "Daemon", value: "Restores every trigger", desc: "`daemon` restores each active workflow's cron and webhook triggers across all profiles, writes a heartbeat every 10 seconds, and installs as a launchd or systemd service. `update` restarts a stale daemon." },
  { label: "MCP", value: "31 / 66 tools", desc: "31 read-only tools over stdio and 66 with `--allow-mutations`. A `--tasks-only` mode serves just the task board." },
  { label: "HTTP API", value: "127.0.0.1:9322", desc: "REST server with an OpenAPI spec, read-only unless mutations are allowed. The webhook server listens on 127.0.0.1:9321." },
  { label: "Orgs", value: "Via monomind", desc: "Org designer with sections, budgets and documents, `org chat`, and signed definitions that need monomind 2.21 or later. Parsers are tested against recorded 2.24.1 output." },
  { label: "Task board", value: "5 columns", desc: "inbox, ready, in_progress, review, done. Agents claim tasks with leases that a comment extends by 30 minutes. A macOS Services menu adds tasks from any app." },
  { label: "Library", value: "monoes.me", desc: "`library list | install | publish | update` for workflows, orgs and automations. Installs verify a sha256, and browsing needs a sign-in." },
  { label: "Distribution", value: "One static binary", desc: "install.sh, release builds for linux, macOS and Windows, `update` with checksum verification, and a desktop app for macOS arm64, Linux amd64 and Windows." },
];

export const securityFacts: Fact[] = [
  {
    badge: "01",
    color: "#8B6914",
    title: "Secrets are encrypted per profile",
    body: "AES-256-GCM with per-profile data keys. The key-encryption key lives in the OS keyring (Keychain, Credential Manager or Secret Service). An opt-in file fallback, MONOAGENT_ALLOW_FILE_KEYRING=1, wraps the key with an argon2id passphrase. There are 43 connectable services across 6 auth methods.",
  },
  {
    badge: "02",
    color: "#8B7355",
    title: "Everything listens on loopback",
    body: "The extension bridge (9222), webhook server (9321) and HTTP API (9322) bind to 127.0.0.1 by default, and the extension bridge requires a shared secret. The /v1 API needs TLS beyond loopback.",
  },
  {
    badge: "03",
    color: "#B8956A",
    title: "No telemetry, local crash reports",
    body: "SECURITY.md states there is no telemetry and nothing phones home. Crash reports are written to ~/.monoagent/crashes/, and filing one to GitHub needs MONOAGENT_CRASH_REPORT=1 plus a second condition.",
  },
  {
    badge: "04",
    color: "#A07840",
    title: "What does leave your machine",
    body: "The agent CLIs behind AI steps send prompts to their own model providers. Browser automations talk to the platforms you point them at, from your own logged-in Chrome. Library browsing and installs call monoes.me.",
  },
];

export const benchmarks = [
  { op: "Expression eval (simple / nested / fallback)", val: "6.8 / 9.0 / 19.4 µs" },
  { op: "Workflow save, 100 nodes and 200 edges", val: "4.65 ms" },
  { op: "Workflow load, 100 nodes and 200 edges", val: "2.73 ms" },
  { op: "Workflow list (cached / uncached)", val: "2.69 / 27 ms" },
  { op: "core.set over 1,000 items", val: "8.9 ms" },
  { op: "core.filter over 1,000 items", val: "16.8 ms" },
  { op: "core.code (goja) over 1,000 items", val: "13.2 ms" },
  { op: "Redact 1,000 items", val: "29.5 ms" },
];

export const benchmarkNote =
  "Measured on an Apple M2 with go1.26.6 on 2026-09-01 (`-benchtime=3s -count=5`). The project's own BENCHMARKS.md calls them illustrative: a weekly CI job runs them, but nothing gates on them. We removed our earlier latency table for browser clicks, LLM calls and webhooks because none of those were ever measured.";
