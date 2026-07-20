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
}

export const projects: Project[] = [
  {
    id: "mono-agent",
    name: "Mono Agent",
    slug: "mono-agent",
    tagline: "Automate anything with a browser",
    description:
      "70+ workflow nodes. Real Chrome automation. Zero cloud. A production-grade orchestration platform combining visual workflow engine, real browser automation, and AI-powered intelligence.",
    repo: "nokhodian/mono-agent",
    language: "Go",
    accent: "#C8A97E",
    number: "01",
    features: [
      {
        icon: "⚡",
        title: "70+ Workflow Nodes",
        description:
          "DAG-based execution across 10 categories — triggers, browser, AI, social, and more.",
      },
      {
        icon: "🌐",
        title: "Real Chrome Automation",
        description:
          "CDP-powered stealth browser with human-like interaction patterns.",
      },
      {
        icon: "🤖",
        title: "200+ AI Models",
        description:
          "OpenRouter, HuggingFace, and Gemini integrations built in.",
      },
      {
        icon: "📦",
        title: "Zero CGO",
        description:
          "Single binary, cross-platform. No dependencies to manage.",
      },
      {
        icon: "🔐",
        title: "Ed25519 Credentials",
        description: "Unified credential system with cryptographic signing.",
      },
      {
        icon: "🎨",
        title: "Visual Workflow Editor",
        description:
          "Wails 2 + React canvas for building workflows visually.",
      },
    ],
    install: [
      {
        command: "go install github.com/nokhodian/mono-agent@latest",
        output: "✓ Installed mono-agent",
      },
      { command: "mono-agent init", output: "✓ Workspace initialized" },
    ],
  },
  {
    id: "monomind",
    name: "monomind",
    slug: "monomind",
    tagline: "Coordinate AI agent swarms from the command line",
    description:
      "v2.5.4. 32 CLI commands, ~130+ subcommands. Fully local memory — SQLite plus local embeddings, no data leaves your machine. Org Runtime v2 adds daemon-controlled autonomous agent orgs with human-in-the-loop approvals and per-agent budgets.",
    repo: "monoes/monomind",
    language: "TypeScript",
    accent: "#8B6914",
    number: "02",
    features: [
      {
        icon: "🖥️",
        title: "32 CLI Commands",
        description:
          "~130+ subcommands total — hooks (29), org runtime (16), memory (12), and more.",
      },
      {
        icon: "🔒",
        title: "Fully Local Memory",
        description:
          "Local SQLite engine with local HF embeddings for semantic search — no data leaves your machine.",
      },
      {
        icon: "🧑‍💼",
        title: "Org Runtime v2",
        description:
          "Daemon-controlled autonomous agent orgs — human-in-the-loop questions/answers, per-agent budgets, and cross-run memory via a knowledge graph.",
      },
      {
        icon: "🏗️",
        title: "Swarm Topologies",
        description:
          "Hierarchical, mesh, hierarchical-mesh, ring, star, adaptive — pick the coordination pattern that fits.",
      },
      {
        icon: "🗳️",
        title: "Hive-Mind Consensus",
        description:
          "Experimental — byzantine, raft, and quorum vote-counting strategies (single-process, not distributed).",
      },
      {
        icon: "🪝",
        title: "29 Hooks + 15 Workers",
        description:
          "Self-learning hook system with 15 background workers — performance, health, security, and more.",
      },
      {
        icon: "🧠",
        title: "Second Brain",
        description:
          "Cross-project memory that persists across projects and survives cleanup — fully local, zero-config.",
      },
      {
        icon: "🕸️",
        title: "Monograph Knowledge Graph",
        description:
          "Tree-sitter across 14 grammars (15 recognized languages — TypeScript grammar also parses JavaScript) into SQLite, 46 MCP tools, PPR/HippoRAG-style graph reranking on by default.",
      },
      {
        icon: "🎨",
        title: "Frontend Design Intelligence",
        description:
          "51 antipattern rules across accessibility, performance, quality, and visual-slop detection, plus design tokens and image-prompt generation (prompts, not images).",
      },
    ],
    install: [
      {
        command: "claude mcp add monomind -- npx -y monomind@latest mcp start",
        output: "✓ MCP server registered",
      },
      {
        command: "npx monomind@latest doctor --fix",
        output: "✓ Environment checked",
      },
    ],
  },
  {
    id: "mono-clip",
    name: "MonoClip",
    slug: "mono-clip",
    tagline: "Your clipboard, with a memory",
    description:
      "Native macOS. AI-ready. 8MB binary. A blazing-fast clipboard manager that lives in your menu bar with AI integration via MCP server.",
    repo: "nokhodian/mono-clip",
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
          "Images, file paths, code snippets — all with thumbnails.",
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
  },
  {
    id: "monotask",
    name: "MonoTask",
    slug: "monotask",
    tagline: "P2P kanban. No server. No nonsense.",
    description:
      "CRDT sync. Ed25519 crypto. Zero knowledge. Boards live locally, synced via CRDTs. Share with teammates using cryptographic invite tokens.",
    repo: "nokhodian/monotask",
    language: "Rust",
    accent: "#A07840",
    number: "04",
    features: [
      {
        icon: "🔗",
        title: "CRDT Sync",
        description: "Automerge-powered — concurrent edits never conflict.",
      },
      {
        icon: "🔐",
        title: "Ed25519 Identity",
        description:
          "Locally generated keypairs. Import from SSH. Cryptographically signed.",
      },
      {
        icon: "📱",
        title: "QR Invites",
        description:
          "Generate invite codes that work offline. Scan to join.",
      },
      {
        icon: "🖥️",
        title: "Desktop + CLI",
        description:
          "Tauri native app with full CLI for scripting and AI agents.",
      },
      {
        icon: "🌐",
        title: "P2P Networking",
        description: "libp2p with mDNS discovery. No server ever.",
      },
      {
        icon: "🤖",
        title: "AI Onboarding",
        description:
          "Built-in ai-help command with structured JSON schema output.",
      },
    ],
    install: [
      { command: "brew install monotask", output: "✓ MonoTask installed" },
      {
        command: 'monotask board create "My Project"',
        output: "✓ Board created · ID: abc123",
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
