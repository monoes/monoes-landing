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
      "An open-source CLI and MCP server that extends Claude Code, OpenCode, Antigravity, Kimi Code and Codex with a codebase knowledge graph, persistent memory and standing teams of AI agents. Install once, then tell it the outcome you want. It assembles the team, coordinates the work, and delivers.",
    repo: "monoes/monomind",
    language: "TypeScript",
    accent: "#8B6914",
    number: "01",
    features: [
      {
        icon: "🏢",
        title: "Autonomous Orgs",
        description:
          "Define a goal and roles, then run the org. An SDK-backed daemon runs live per-role sessions with budgets, approvals, schedules and logs. Large orgs split into isolated sections with their own budgets, and documents are the only channel between them.",
      },
      {
        icon: "🧠",
        title: "Memory and Code Graph",
        description:
          "A pattern store with episodic recall carries context across sessions. Monograph, a SQLite code knowledge graph, shows callers, imports and blast radius before you change anything.",
      },
      {
        icon: "🧩",
        title: "Agents and Skills",
        description:
          "83 agents, 82 skills and 560 org skills, ranked per task so the best fit is picked for you. Add your own as plain Markdown files.",
      },
      {
        icon: "⚡",
        title: "Mastermind Commands",
        description:
          "40 /mastermind:* workflows for planning, executing, reviewing, debugging, releasing and researching. Autonomous loops that run until done.",
      },
      {
        icon: "🔌",
        title: "Works With Your Tools",
        description:
          "Plugs into Claude Code, OpenCode, Antigravity, Kimi Code and Codex over MCP. Coder mode drives claude, codex, copilot, antigravity, opencode and more through one interface.",
      },
      {
        icon: "🔒",
        title: "Local and Governed",
        description:
          "Runs on your machine and keeps its own state there. Use local models through Ollama or llama.cpp, even offline. Orgs run only when you sign them, and opt-in sandbox policies can deny a role exec, reads or writes.",
      },
    ],
    install: [
      {
        command: "npm install -g monomind",
        output: "✓ Monomind installed",
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
    tagline: "Local-first automation in one Go binary. Humans and AI agents, with approval gates.",
    description:
      "A local-first n8n alternative in a single static Go binary: visual workflows, a 180+ command CLI and human-in-the-loop approvals. 160+ node types, your own logged-in Chrome for browser automation, and AI that runs on the agent runtimes you already have installed. All data stays on your machine.",
    repo: "monoes/mono-agent",
    language: "Go",
    accent: "#C8A97E",
    number: "02",
    features: [
      {
        icon: "⚡",
        title: "160+ Workflow Nodes",
        description:
          "A DAG engine across services (GitHub, Google Workspace, Stripe, Salesforce, HubSpot, Jira, Notion), databases, HTTP, data transforms, comms and social platforms.",
      },
      {
        icon: "🌐",
        title: "Your Own Chrome",
        description:
          "Where no practical API exists, workflows drive your own logged-in Chrome through a bundled extension bridge to publish to and read your own accounts.",
      },
      {
        icon: "👤",
        title: "Multi-Profile Isolation",
        description:
          "Named profiles with fully isolated databases, credentials and task boards. Switch accounts without cross-contamination.",
      },
      {
        icon: "🤝",
        title: "Human-in-Loop",
        description:
          "Pause any workflow for review, edit the payload, then approve or reject. The queue is durable and survives restarts.",
      },
      {
        icon: "🤖",
        title: "AI on Your Agent Runtimes",
        description:
          "AI steps run on the agent CLIs you already have (claude, codex, opencode, antigravity and more) through monomind, using each runtime's own login. No text-AI keys stored, plus an OpenAI-compatible local API over those runtimes.",
      },
      {
        icon: "🖥️",
        title: "Canvas, CLI and MCP",
        description:
          "A Wails desktop canvas editor, a CLI with JSON output everywhere, a built-in MCP server for AI agents, and a per-profile task board for people and agents.",
      },
    ],
    install: [
      {
        command: "curl -fsSL https://raw.githubusercontent.com/monoes/mono-agent/master/install.sh | bash",
        output: "✓ Installed monoagentcli (checksum verified)",
      },
      { command: "monoagentcli node list", output: "✓ 160+ node types" },
      { command: "monoagentcli ref", output: "✓ Built-in offline docs" },
    ],
    cli: {
      binary: "monoagentcli",
      intro:
        "180+ commands for scripting social actions, browser automation, workflow execution, and AI-powered content generation. Every command accepts --profile <name> to scope all data to a fully isolated workspace.",
      aiNote:
        "Wire mono-agent into any AI pipeline: define a workflow in JSON, import it, schedule it with cron, and pipe structured output to the next step. The --profile flag lets multiple AI agents operate in parallel without touching each other's data.",
      groups: [
        {
          title: "Profiles",
          description: "All data is scoped per profile. Switch without stopping running workflows.",
          commands: [
            "monoagentcli --profile work workflow list",
            "monoagentcli --profile client-a login instagram",
            "monoagentcli --profile work workflow run --id <id>",
          ],
        },
        {
          title: "Workflows",
          description: "Create, import, run, and schedule DAG workflows.",
          commands: [
            "monoagentcli workflow list",
            "monoagentcli workflow create --name \"Daily Post\"",
            "monoagentcli workflow import --file flow.json",
            "monoagentcli workflow run --id <id>",
            "monoagentcli workflow executions --id <id>",
            "monoagentcli workflow activate --id <id>",
          ],
        },
        {
          title: "Node Execution",
          description: "Run any of the 160+ node types directly from the CLI.",
          commands: [
            "monoagentcli node list",
            "monoagentcli node run \\",
            "  --type action.instagram.publish_post \\",
            "  --config '{\"text\":\"Hello world!\"}'",
          ],
        },
        {
          title: "Auth & Connections",
          description: "Browser-session login for social platforms; API keys for services.",
          commands: [
            "monoagentcli login instagram",
            "monoagentcli login linkedin",
            "monoagentcli login status",
            "monoagentcli connect list",
            "monoagentcli connect test --id <cred-id>",
          ],
        },
        {
          title: "People & Data",
          description: "Search platforms, import contacts, export results.",
          commands: [
            "monoagentcli search --platform instagram --keyword \"leads\"",
            "monoagentcli people list",
            "monoagentcli people import --file contacts.csv",
            "monoagentcli list create --name \"Leads Q1\"",
            "monoagentcli export --platform instagram --format csv",
          ],
        },
        {
          title: "Scheduling",
          description: "Attach cron triggers to any workflow.",
          commands: [
            "monoagentcli schedule add --action <id> --cron \"0 9 * * *\"",
            "monoagentcli schedule list",
            "monoagentcli schedule remove --id <id>",
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
