export interface CLIGroup {
  title: string;
  description?: string;
  commands: string[];
}

export interface CLISectionData {
  binary: string;
  intro: string;
  aiNote: string;
  groups: CLIGroup[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  repo: string;
  language: string;
  accent: string;
  number: string;
  features: { icon: string; title: string; description: string }[];
  install: { command: string; output?: string }[];
  cli?: CLISectionData;
}

export const projects: Project[] = [
  {
    id: "monomind",
    name: "Monomind",
    slug: "monomind",
    tagline: "Local memory, a code graph and agent teams for your AI coding assistant.",
    description:
      "An open-source (Apache-2.0) CLI and MCP server for Claude Code, Codex, OpenCode, Kimi Code and Antigravity. It adds persistent memory stored locally in SQLite with on-device embeddings, a tree-sitter knowledge graph of your codebase, semantic search over your own documents, and autonomous agent orgs that run as a policy-gated background daemon. Your code, memory and documents stay on your machine.",
    repo: "monoes/monomind",
    language: "TypeScript",
    accent: "#8B6914",
    number: "01",
    features: [
      {
        icon: "🏢",
        title: "Autonomous Orgs",
        description:
          "Define roles, reporting lines and per-role tool, file and budget policy in one JSON file, then run it as a background daemon with human approval gates, cross-run memory and a live dashboard. 14 runtimes, including the Claude Agent SDK, Codex, OpenCode, Kimi Code and Copilot.",
      },
      {
        icon: "🧠",
        title: "Local Memory",
        description:
          "Local SQLite with on-device embeddings (gte-modernbert-base) and an HNSW index that switches on automatically past 5,000 entries. No cloud vector database, no API key. Context survives across sessions, agents and orgs.",
      },
      {
        icon: "🗺️",
        title: "Codebase Knowledge Graph",
        description:
          "Monograph parses your code with tree-sitter (TypeScript, Python, Go, Rust, Java, C/C++, C#, Ruby, Swift, PHP, Kotlin, Dart and more) into a SQLite graph, so your assistant sees callers, impact and blast radius before it edits.",
      },
      {
        icon: "📚",
        title: "Second Brain",
        description:
          "Drop in Markdown, PDF or DOCX and the relevant excerpts are injected into every prompt by meaning, not keywords. Fully local, with a personal global brain shared across projects.",
      },
      {
        icon: "⚡",
        title: "Mastermind Workflows",
        description:
          "42 /mastermind slash commands (plan, execute, review, debug, release, research, worktree and more), plus 88 agents and 86 skills installed into your project. Add --tillend to repeat until nothing is left to do.",
      },
      {
        icon: "🛡️",
        title: "Guardrails & Hooks",
        description:
          "MonoFence blocks prompt injection before shell commands and file writes, and gates catch destructive commands and secrets. Backed by 28 hook subcommands and 9 background workers that refresh at session start.",
      },
    ],
    install: [
      { command: "npm install -g monomind" },
      { command: "monomind init", output: "Monomind initialized successfully!" },
      { command: "claude mcp add monomind -- npx -y monomind@latest mcp start" },
      { command: "monomind mcp verify" },
    ],
    cli: {
      binary: "monomind",
      intro:
        "Everything is also available from the terminal. The commands you'll use most, grouped by job.",
      aiNote:
        "Inside Claude Code and the other supported assistants, the same features are exposed through the MCP server (69 tools by default, 217 on demand) and /mastermind:* slash commands, so you rarely need to type these yourself.",
      groups: [
        {
          title: "Setup & health",
          description: "Install into a project and check it.",
          commands: [
            "monomind init",
            "monomind init --target codex",
            "monomind mcp start",
            "monomind mcp verify",
            "monomind doctor --fix",
          ],
        },
        {
          title: "Autonomous orgs",
          description: "Run agent organizations as a background daemon.",
          commands: [
            "monomind org create blog --template content-team --goal \"3 posts/week\"",
            "monomind org validate blog",
            "monomind org run blog --task \"weekly report\"",
            "monomind org status",
            "monomind org questions blog",
            "monomind org stop blog",
          ],
        },
        {
          title: "Memory",
          description: "Local SQLite memory with semantic search.",
          commands: [
            "monomind memory store --key \"auth\" --value \"JWT with refresh\" --namespace patterns",
            "monomind memory search -q \"authentication patterns\"",
            "monomind memory stats",
          ],
        },
        {
          title: "Second Brain",
          description: "Index and search your own documents locally.",
          commands: [
            "monomind doc ingest ./notes",
            "monomind doc search -q \"pricing notes\"",
            "monomind doc list",
          ],
        },
        {
          title: "Code graph",
          description: "Build and query the Monograph knowledge graph.",
          commands: [
            "monomind monograph build",
            "monomind monograph stats",
            "monomind monograph watch",
          ],
        },
        {
          title: "Swarms, routing & security",
          description: "Coordination, agent routing and scanning.",
          commands: [
            "monomind monoswarm init --topology hierarchical",
            "monomind route \"fix the login bug\"",
            "monomind security scan",
          ],
        },
      ],
    },
  },
  {
    id: "mono-agent",
    name: "Mono Agent",
    slug: "mono-agent",
    tagline: "The local-first n8n alternative in a single Go binary.",
    description:
      "Open-source (MIT) workflow automation that runs on your own machine. One static Go binary with embedded SQLite: no Docker, no database server, no telemetry. Build DAG workflows from 100+ node types in a visual desktop editor, a 180+ command CLI, or through its MCP server, and put a human approval step in front of anything that leaves your machine.",
    repo: "monoes/mono-agent",
    language: "Go",
    accent: "#C8A97E",
    number: "02",
    features: [
      {
        icon: "🤝",
        title: "Human-in-the-Loop",
        description:
          "Drop a human review node anywhere. Reviewers edit the draft, then approve or reject. The queue survives restarts and can auto-reject on timeout.",
      },
      {
        icon: "📦",
        title: "One Binary, Local-First",
        description:
          "A single static Go executable with SQLite built in. Workflows, run history and credentials stay under ~/.monoagent on your machine. No Docker, no cloud, no telemetry.",
      },
      {
        icon: "🔌",
        title: "MCP & CLI for AI Agents",
        description:
          "A built-in MCP server (read-only by default), --json output everywhere, documented exit codes and an offline reference manual, so Claude Code, Codex and other agents can build, run and approve workflows.",
      },
      {
        icon: "⚡",
        title: "100+ Node Types",
        description:
          "Google Sheets, Gmail, Outlook, Slack, GitHub, Linear, Jira, Notion, Airtable, Stripe, Shopify, Salesforce, HubSpot, Postgres, MySQL, MongoDB, Redis, HTTP, SSH, JavaScript code and more.",
      },
      {
        icon: "🤖",
        title: "AI Through Your Own Agents",
        description:
          "The agent.ask node hands prompts to agent CLIs on your machine (Claude Code, Codex, Qwen, Kimi and more). Gemini text and image nodes use your own browser session, so no API key is needed.",
      },
      {
        icon: "🔐",
        title: "Encrypted Vault & Profiles",
        description:
          "Secrets are encrypted with AES-256-GCM and the key lives in your OS keyring. Named profiles keep workflows, connections and contacts apart, each with its own vault.",
      },
    ],
    install: [
      {
        command: "curl -fsSL https://raw.githubusercontent.com/monoes/mono-agent/master/install.sh | bash",
        output: "✓ Installed monoagentcli (SHA256 verified)",
      },
      { command: "monoagentcli setup", output: "✓ Guided setup complete" },
      { command: "monoagentcli workflow templates list" },
    ],
    cli: {
      binary: "monoagentcli",
      intro:
        "180+ commands, all with --json output and documented exit codes. Every command accepts --profile <name> to scope it to one workspace.",
      aiNote:
        "Built for AI agents: register monoagentcli mcp as an MCP server, or drive the CLI directly. Workflows are plain JSON, so an agent can write one, validate it, run it and read per-node outputs, then approve human-review items from the same interface.",
      groups: [
        {
          title: "Workflows",
          description: "Import, validate, run and activate DAG workflows.",
          commands: [
            "monoagentcli workflow list",
            "monoagentcli workflow import --file flow.json",
            "monoagentcli workflow validate <id>",
            "monoagentcli workflow run <id> --json",
            "monoagentcli workflow executions <id>",
            "monoagentcli workflow activate <id>",
          ],
        },
        {
          title: "Human-in-the-Loop",
          description: "Review, edit and approve paused runs.",
          commands: [
            "monoagentcli hil list",
            "monoagentcli hil approve <id>",
            "monoagentcli hil reject <id>",
          ],
        },
        {
          title: "AI Agents & MCP",
          description: "Let agents operate mono-agent, and hand AI steps to the agents on your machine.",
          commands: [
            "monoagentcli mcp",
            "monoagentcli mcp --allow-mutations",
            "monoagentcli agent scan --installed",
            "monoagentcli ref node core.human_in_loop",
          ],
        },
        {
          title: "Nodes",
          description: "Inspect or run any node type directly.",
          commands: [
            "monoagentcli node list",
            "monoagentcli node schema core.if",
            "monoagentcli node run http.request \\",
            "  --config '{\"method\":\"GET\",\"url\":\"https://httpbin.org/get\"}'",
          ],
        },
        {
          title: "Secrets & Connections",
          description: "Encrypted vault, API keys and OAuth.",
          commands: [
            "monoagentcli secret add --kind secret --name openai-key",
            "monoagentcli secret list",
            "monoagentcli connect list",
            "monoagentcli connect test <id>",
          ],
        },
        {
          title: "Profiles & Scheduling",
          description: "Scope data per workspace, and keep cron and webhook triggers running.",
          commands: [
            "monoagentcli profile create work",
            "monoagentcli --profile work workflow list",
            "monoagentcli daemon",
            "monoagentcli daemon install",
          ],
        },
      ],
    },
  },
  {
    id: "mono-clip",
    name: "MonoClip",
    slug: "mono-clip",
    tagline: "Your clipboard, with a memory",
    description:
      "Cross-platform (macOS, Windows, Linux). AI-ready. ~8MB binary. A blazing-fast clipboard manager that lives in your menu bar with AI integration via MCP server.",
    repo: "monoes/mono-clip",
    language: "Rust",
    accent: "#B8956A",
    number: "03",
    features: [
      {
        icon: "📋",
        title: "Smart Folders",
        description:
          "Auto-categorize clips into custom folders with global shortcut routing.",
      },
      {
        icon: "🔍",
        title: "Instant Search",
        description:
          "Full-text search across your entire clip history in milliseconds.",
      },
      {
        icon: "🖼️",
        title: "Rich Capture",
        description:
          "Images, file paths, code snippets, all with thumbnails.",
      },
      {
        icon: "🤖",
        title: "AI-Ready CLI",
        description:
          "MCP server for Claude Desktop, Cursor, and Windsurf integration.",
      },
      {
        icon: "📌",
        title: "Pin & Persist",
        description: "Pin important clips that survive cleanup cycles.",
      },
      {
        icon: "🪶",
        title: "~8MB Binary",
        description:
          "Native Tauri + Rust. ~30MB RAM vs 150MB+ for Electron alternatives.",
      },
    ],
    install: [
      { command: "brew install monoclip", output: "✓ MonoClip installed" },
      {
        command: "mclip status",
        output: "✓ Clipboard watching · 0 clips",
      },
    ],
    cli: {
      binary: "mclip",
      intro:
        "mclip installs automatically with the app and gives your terminal and AI assistants direct access to your clipboard history. Pipe clips into commands, search across history, and manage folders from any script.",
      aiNote:
        "Run mclip mcp to start a JSON-RPC stdio server that exposes your clipboard as native AI tools. Add it to Claude Desktop, Cursor, or Windsurf config once and your AI assistant can read, search, pin, and organize clips without leaving the chat.",
      groups: [
        {
          title: "Clips",
          description: "Read and manage clipboard history.",
          commands: [
            "mclip list                    # recent inbox",
            "mclip list --folder Work      # by folder",
            "mclip list --search http      # full-text search",
            "mclip add \"text\"              # add a clip",
            "mclip get <id>                # print raw content",
            "mclip get <id> | pbcopy       # pipe to clipboard",
            "mclip remove <id>             # delete",
            "mclip pin <id>                # pin (survives cleanup)",
          ],
        },
        {
          title: "Folders",
          description: "Organize clips into named folders with optional global shortcuts.",
          commands: [
            "mclip folder list",
            "mclip folder add \"Code Snippets\"",
            "mclip folder remove \"Old Folder\"",
            "mclip add \"text\" --folder \"Code Snippets\"",
          ],
        },
        {
          title: "AI Integration",
          description: "Give AI assistants native access to your clipboard.",
          commands: [
            "# Copy AI context for any chat UI:",
            "mclip context",
            "",
            "# Start MCP server for Claude/Cursor/Windsurf:",
            "mclip mcp",
            "",
            "# Available MCP tools:",
            "# list_clips · add_clip · get_clip",
            "# remove_clip · pin_clip · unpin_clip",
            "# list_folders · create_folder · delete_folder",
          ],
        },
      ],
    },
  },
  {
    id: "monotask",
    name: "MonoTask",
    slug: "monotask",
    tagline: "P2P kanban. No server. No account. No nonsense.",
    description:
      "Local-first kanban built in Rust. Boards live in SQLite, synced via Automerge CRDTs over iroh QUIC. Concurrent edits merge automatically, no server required. Share Spaces with Ed25519-signed invite tokens. Nothing phones home.",
    repo: "monoes/monotask",
    language: "Rust",
    accent: "#A07840",
    number: "04",
    features: [
      {
        icon: "🔗",
        title: "Automerge + iroh",
        description: "Automerge CRDTs for conflict-free edits, synced over iroh QUIC. Fast, encrypted, NAT-traversing.",
      },
      {
        icon: "🌐",
        title: "Spaces",
        description:
          "Shared workspaces with cryptographic invite, revoke, and kick flows. Works offline.",
      },
      {
        icon: "🃏",
        title: "Full Kanban",
        description:
          "Boards, Columns, Cards, Subtasks, Checklists, Comments, and Custom fields.",
      },
      {
        icon: "📱",
        title: "QR Invites",
        description:
          "Generate QR codes for invite tokens. Scan to join, no account required.",
      },
      {
        icon: "🖥️",
        title: "Desktop + CLI",
        description:
          "Tauri v2 native app plus a full CLI with --json output for scripting and AI agents.",
      },
      {
        icon: "💬",
        title: "P2P Chat",
        description:
          "Per-space chat via Automerge, synced peer-to-peer. No relay server.",
      },
    ],
    install: [
      { command: "brew install monotask", output: "✓ MonoTask installed" },
      {
        command: 'monotask board create "My Project"',
        output: "✓ Board created · ID: abc123",
      },
    ],
    cli: {
      binary: "monotaskcli",
      intro:
        "Every feature in the desktop app is fully scriptable with monotaskcli. All commands support --json output for machine-readable results, making it a natural fit for AI agent pipelines, shell scripts, and CI workflows.",
      aiNote:
        "Run monotaskcli ai-help to get the full command catalog with JSON schemas formatted for AI ingestion. Drop it into a system prompt and your AI agent can create boards, move cards, sync GitHub issues, and manage spaces without any additional tooling.",
      groups: [
        {
          title: "Profile & Identity",
          description: "Ed25519 identity stored locally. Import from an existing SSH key.",
          commands: [
            "monotaskcli profile show",
            "monotaskcli profile set-name \"Ada\"",
            "monotaskcli profile import-ssh-key",
          ],
        },
        {
          title: "Spaces",
          description: "Shared workspaces with cryptographic invite and member management.",
          commands: [
            "monotaskcli space create \"Team Alpha\"",
            "monotaskcli space list",
            "monotaskcli space invite generate <space-id>",
            "monotaskcli space join <token>",
            "monotaskcli space members list <space-id>",
            "monotaskcli space members kick <space-id> <pubkey>",
          ],
        },
        {
          title: "Boards",
          description: "Boards live inside a Space. Undo/redo stack included.",
          commands: [
            "monotaskcli board create \"Sprint 1\" --space <id> --json",
            "monotaskcli board list --json",
            "monotaskcli board rename <id> \"New Name\"",
            "monotaskcli board undo <id>",
            "monotaskcli board redo <id>",
          ],
        },
        {
          title: "Cards",
          description: "Full CRUD plus properties, labels, comments, subtasks, and links.",
          commands: [
            "monotaskcli card create <board> <col> \"Fix the thing\" --json",
            "monotaskcli card list <board> --json",
            "monotaskcli card move <board> <card> <to-col>",
            "monotaskcli card set-priority <board> <card> high",
            "monotaskcli card set-due-date <board> <card> 2025-12-31",
            "monotaskcli card comment add <board> <card> \"LGTM\"",
            "monotaskcli card attach-image <board> <card> image.png",
          ],
        },
        {
          title: "External Sync",
          description: "Two-way sync with GitHub Issues, Linear, and email CRM.",
          commands: [
            "# GitHub Issues sync",
            "monotaskcli github sync <board-id>",
            "",
            "# Linear Issues sync",
            "monotaskcli linear sync <board-id>",
            "",
            "# Email CRM (Gmail / Outlook / IMAP)",
            "monotaskcli mail sync <board-id>",
          ],
        },
        {
          title: "P2P Sync Daemon",
          description: "Start the iroh QUIC sync daemon to share boards with peers.",
          commands: [
            "monotaskcli sync                  # foreground",
            "monotaskcli sync --detach          # background",
            "monotaskcli sync --status          # check running",
            "monotaskcli sync --stop            # stop daemon",
            "monotaskcli sync --peer <addr>     # connect to peer",
          ],
        },
      ],
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
