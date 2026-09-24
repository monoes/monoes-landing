import type { Guide } from "./types";

const UPDATED = "September 24, 2026";

const MONOMIND_RELATED = [
  { label: "Monomind", href: "/projects/monomind" },
  { label: "Local SQLite agent memory", href: "/guides/local-ai-agent-memory-sqlite" },
  { label: "All comparisons", href: "/compare" },
];

export const agentComparisons: Guide[] = [
  {
    slug: "monomind-vs-crewai",
    title: "Monomind vs CrewAI: agent teams inside your coding assistant vs a Python framework",
    description:
      "Compare Monomind and CrewAI: what each is, where each is stronger, memory, codebase awareness, and who should choose which.",
    summary:
      "CrewAI is a Python framework for building role-based multi-agent applications in your own code. Monomind is an open-source (Apache 2.0) CLI and MCP server that adds a local codebase knowledge graph, persistent SQLite memory, multi-agent coordination and policy-gated background agent orgs to AI coding assistants such as Claude Code, Codex and OpenCode - with no code to write. Pick CrewAI to ship multi-agent features inside a Python product; pick Monomind to make your coding assistant work as a team.",
    updated: UPDATED,
    table: {
      columns: ["", "Monomind", "CrewAI"],
      rows: [
        ["What it is", "Extension + MCP server for coding assistants", "Python library for multi-agent apps"],
        ["Language", "TypeScript / Node.js 22+", "Python"],
        ["How you use it", "monomind init, then slash commands and MCP tools", "Write Python classes for agents, tasks and crews"],
        ["Codebase knowledge graph", "Yes (Monograph, tree-sitter, 25 file types)", "Not built in"],
        ["Memory", "Local SQLite + local embeddings, HNSW index", "Built-in memory, local storage by default"],
        ["Background agent teams", "Org daemon with per-role policies, budgets, approvals, dashboard", "Crews run from your code"],
        ["LLM choice", "Via coding-agent runtimes (Claude Agent SDK, Codex, OpenCode, and 11 more)", "Any LLM provider"],
        ["License", "Apache 2.0", "MIT"],
      ],
    },
    sections: [
      {
        heading: "Where Monomind is stronger",
        bullets: [
          "Zero-code: it plugs into the assistant you already use and adds 88 agents, 86 skills and 40+ workflow commands.",
          "Knows your codebase: callers, callees and blast radius of a change before the assistant edits it.",
          "Local memory and document search (Markdown, PDF, DOCX) ready out of the box.",
          "Long-running orgs with per-role tool allow/deny lists, file scopes, token budgets, audit trails and human approval gates.",
        ],
      },
      {
        heading: "Where CrewAI is stronger",
        bullets: [
          "Embedding multi-agent logic in your own Python application or backend.",
          "Free choice of LLM provider for general-purpose apps.",
          "A larger community, tutorial base and third-party tool ecosystem.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Monomind a CrewAI alternative?",
        answer:
          "Only for some jobs. If you want AI agent teams to do software, research or business work through Claude Code or similar assistants, Monomind replaces the need to write a CrewAI app. If you are building a multi-agent feature into your own Python product, CrewAI is the right tool.",
      },
    ],
    related: [{ label: "Monomind vs LangGraph", href: "/compare/monomind-vs-langgraph" }, ...MONOMIND_RELATED],
  },
  {
    slug: "monomind-vs-langgraph",
    title: "Monomind vs LangGraph: ready-made agent workflows vs an agent graph library",
    description:
      "Compare Monomind and LangGraph: programming model, control flow, memory, observability and when to pick each.",
    summary:
      "LangGraph is a Python/JS library for building stateful agent services as explicit graphs with checkpointing, backed by LangChain's hosted platform and LangSmith observability. Monomind is a zero-code extension for AI coding assistants that ships a local code knowledge graph, persistent SQLite memory, document search and plan/execute/review workflows. Pick LangGraph to engineer a production agent service; pick Monomind to supercharge the assistant you already use.",
    updated: UPDATED,
    table: {
      columns: ["", "Monomind", "LangGraph"],
      rows: [
        ["Programming model", "Slash commands, MCP tools, org configs (JSON)", "Explicit nodes, edges and state in code"],
        ["Control flow", "Workflow commands and policy gates", "Fine-grained, deterministic, resumable checkpoints"],
        ["Built-in extras", "Code graph, local memory, document brain, hooks, security gate", "Checkpointers (incl. SQLite), human interrupts"],
        ["Observability", "Local dashboard, event logs, decision traces", "LangSmith (hosted)"],
        ["Best for", "Developers and teams working through coding assistants", "Engineers shipping agent backends"],
      ],
    },
    sections: [
      {
        heading: "Which should you choose?",
        paragraphs: [
          "LangGraph wins when you need explicit, testable state machines and durable execution inside a product you are building.",
          "Monomind wins when the goal is to get work done with Claude Code, Codex, OpenCode, Antigravity or Kimi Code today - with memory that persists across sessions, codebase awareness and agent teams you can leave running - without writing an agent application.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use Monomind and LangGraph together?",
        answer:
          "Yes. They solve different layers: LangGraph is a library you build with, and Monomind is tooling around your coding assistant. You can use Monomind while developing a LangGraph application.",
      },
    ],
    related: [{ label: "Monomind vs CrewAI", href: "/compare/monomind-vs-crewai" }, ...MONOMIND_RELATED],
  },
  {
    slug: "monomind-vs-claude-code-subagents",
    title: "Monomind vs plain Claude Code subagents: what the extension adds",
    description:
      "What Monomind adds on top of Claude Code's built-in subagents, skills and hooks, what it costs, and when plain Claude Code is enough.",
    summary:
      "Claude Code already has subagents, custom agents, skills, slash commands, hooks and MCP support. Monomind adds what it lacks: memory that persists across sessions in local SQLite, a codebase knowledge graph for impact analysis, document retrieval injected into prompts, 88 ready-made agents and 40+ workflows, background agent orgs that keep running after you close the session, and a prompt-injection gate. Small projects often don't need it.",
    updated: UPDATED,
    sections: [
      {
        heading: "What Monomind adds",
        bullets: [
          "Cross-session memory stored locally with local embeddings (no cloud vector database).",
          "Monograph: callers, callees and blast radius of a symbol before an edit.",
          "Second Brain: your Markdown, PDF and DOCX files searched and injected into relevant prompts.",
          "Org Runtime: policy-gated role hierarchies that run as a daemon with a live dashboard, budgets and approvals.",
          "MonoFence: local prompt-injection and jailbreak detection as a pre-bash / pre-write gate.",
          "One monomind init configures Claude Code, OpenCode, Antigravity, Kimi Code and Codex the same way.",
        ],
      },
      {
        heading: "What it costs",
        bullets: [
          "More hooks, MCP tools and context in every session.",
          "Node.js 22.12+ and native dependencies (better-sqlite3, tree-sitter).",
          "A larger surface to learn.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does Monomind replace Claude Code?",
        answer:
          "No. Monomind runs on top of Claude Code (and other assistants). Parallel work is still done by the assistant's own subagents; Monomind coordinates them and adds memory, the code graph and workflows.",
      },
      {
        question: "Is Monomind free?",
        answer: "Yes. It is open source under Apache 2.0 and installed with npm install -g monomind.",
      },
    ],
    related: MONOMIND_RELATED,
  },
];
