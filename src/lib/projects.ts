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
    tagline: "Hire an AI team. Set a goal. Walk away. $0.",
    description:
      "Autonomous Claude Code orchestration with persistent memory, self-coordinating agent orgs, and a codebase knowledge graph. Install once, wire into Claude Code, then tell it the outcome you want. It assembles the team, coordinates the work, and delivers.",
    repo: "monoes/monomind",
    language: "TypeScript",
    accent: "#8B6914",
    number: "01",
    features: [
      {
        icon: "🏢",
        title: "Autonomous Orgs",
        description:
          "Define a goal, assign roles, start the org. An SDK-backed daemon (Org Runtime v2) runs live per-role agent sessions that coordinate over a shared mailbox across sessions.",
      },
      {
        icon: "🧠",
        title: "Persistent Memory",
        description:
          "Local SQLite with local embeddings (no cloud vector DB) plus a separate Monograph knowledge graph for code structure. Context survives across sessions and agents.",
      },
      {
        icon: "⚡",
        title: "Mastermind Commands",
        description:
          "autodev, build, review, release, debug. Autonomous loops that run until done.",
      },
      {
        icon: "🏗️",
        title: "Swarm Topologies",
        description:
          "Hierarchical, mesh, hierarchical-mesh, and adaptive coordination out of the box.",
      },
      {
        icon: "🗳️",
        title: "Consensus Strategies",
        description:
          "Byzantine, Raft, and Quorum vote-counting for multi-agent decisions (single-process, not distributed). Gossip and CRDT are planned, not yet implemented.",
      },
      {
        icon: "🪝",
        title: "Hooks + Workers",
        description:
          "29 hook CLI subcommands plus 15 background workers (security, performance, git, and more) for self-learning automation.",
      },
    ],
    install: [
      {
        command: "npm install -g monomind",
        output: "✓ Monomind installed (@monoes/monomindcli v2.8.4)",
      },
      {
        command: "npm install -g @monoes/monomindcli",
        output: "✓ Alternative package name supported",
      },
      {
        command: "monomind init",
        output: "✓ Project initialized",
      },
    ],
  },
  {
    id: "mono-agent",
    name: "Mono Agent",
    slug: "mono-agent",
    tagline: "n8n meets Playwright. Self-hosted, multi-profile automation.",
    description:
      "70+ workflow nodes. Stealth Chrome via Rod. Multi-profile isolation. A production-grade automation platform with a visual DAG editor, real browser automation, AI integrations, and Human-in-Loop controls. Fully self-hosted, zero cloud.",
    repo: "monoes/mono-agent",
    language: "Go",
    accent: "#C8A97E",
    number: "02",
    features: [
      {
        icon: "⚡",
        title: "70+ Workflow Nodes",
        description:
          "DAG-based execution across triggers, browser, AI, social, image, and data nodes.",
      },
      {
        icon: "🌐",
        title: "Stealth Browser",
        description:
          "Rod-powered Chrome automation with human-like interaction patterns for social platforms.",
      },
      {
        icon: "👤",
        title: "Multi-Profile Isolation",
        description:
          "Named profiles with fully isolated DBs. Switch accounts without cross-contamination.",
      },
      {
        icon: "🤝",
        title: "Human-in-Loop",
        description:
          "Pause any workflow for human review or editing before continuing.",
      },
      {
        icon: "🤖",
        title: "AI Integrations",
        description:
          "OpenRouter, HuggingFace, and Gemini. 200+ models accessible from any workflow node.",
      },
      {
        icon: "🎨",
        title: "Visual Workflow Editor",
        description:
          "Wails 2 + React canvas with AI chat, Image Vault, and drag-and-drop node builder.",
      },
    ],
    install: [
      {
        command: "go install github.com/monoes/mono-agent@latest",
        output: "✓ Installed mono-agent",
      },
      { command: "mono-agent init", output: "✓ Workspace initialized" },
    ],
    cli: {
      binary: "monoes",
      intro:
        "70+ commands for scripting social actions, browser automation, workflow execution, and AI-powered content generation. Every command accepts --profile <name> to scope all data to a fully isolated workspace.",
      aiNote:
        "Wire monoes into any AI pipeline: define a workflow in JSON, import it, schedule it with cron, and pipe structured output to the next step. The --profile flag lets multiple AI agents operate in parallel without touching each other's data.",
      groups: [
        {
          title: "Profiles",
          description: "All data is scoped per profile. Switch without stopping running workflows.",
          commands: [
            "monoes --profile work workflow list",
            "monoes --profile client-a login instagram",
            "monoes --profile work workflow run --id <id>",
          ],
        },
        {
          title: "Workflows",
          description: "Create, import, run, and schedule DAG workflows.",
          commands: [
            "monoes workflow list",
            "monoes workflow create --name \"Daily Post\"",
            "monoes workflow import --file flow.json",
            "monoes workflow run --id <id>",
            "monoes workflow executions --id <id>",
            "monoes workflow activate --id <id>",
          ],
        },
        {
          title: "Node Execution",
          description: "Run any of the 70+ node types directly from the CLI.",
          commands: [
            "monoes node list",
            "monoes node run \\",
            "  --type action.instagram.publish_post \\",
            "  --config '{\"text\":\"Hello world!\"}'",
          ],
        },
        {
          title: "Auth & Connections",
          description: "Browser-session login for social platforms; API keys for services.",
          commands: [
            "monoes login instagram",
            "monoes login linkedin",
            "monoes login status",
            "monoes connect list",
            "monoes connect test --id <cred-id>",
          ],
        },
        {
          title: "People & Data",
          description: "Search platforms, import contacts, export results.",
          commands: [
            "monoes search --platform instagram --keyword \"leads\"",
            "monoes people list",
            "monoes people import --file contacts.csv",
            "monoes list create --name \"Leads Q1\"",
            "monoes export --platform instagram --format csv",
          ],
        },
        {
          title: "Scheduling",
          description: "Attach cron triggers to any workflow.",
          commands: [
            "monoes schedule add --action <id> --cron \"0 9 * * *\"",
            "monoes schedule list",
            "monoes schedule remove --id <id>",
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
      "Native macOS. AI-ready. 8MB binary. A blazing-fast clipboard manager that lives in your menu bar with AI integration via MCP server.",
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
            "# remove_clip · pin_clip",
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
