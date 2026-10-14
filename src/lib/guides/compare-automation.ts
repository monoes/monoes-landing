import type { Guide } from "./types";

const UPDATED = "October 13, 2026";

const MONO_AGENT_RELATED = [
  { label: "Mono Agent", href: "/projects/mono-agent" },
  { label: "All comparisons", href: "/compare" },
  { label: "Monoes Workforce", href: "/workforce" },
];

export const automationComparisons: Guide[] = [
  {
    slug: "mono-agent-vs-n8n",
    title: "Mono Agent vs n8n: a local-first n8n alternative in a single Go binary",
    description:
      "Honest comparison of Mono Agent and n8n: licensing, install footprint, integrations, human-in-the-loop approvals, AI agent support, and when n8n is the better choice.",
    summary:
      "Mono Agent is a free workflow automation tool (proprietary license, free of charge for now) that ships as one static Go binary with embedded SQLite, a desktop app, a built-in human-approval step and an MCP server for AI agents. Its AI steps run on the agent CLI you already pay for, such as Claude Code or Codex, so it stores no AI keys and sells no AI credits. n8n is a far more mature platform with 1,500+ integrations, a hosted cloud, team features and source you can read. Pick Mono Agent for local-first, CLI- and agent-driven automation with approvals; pick n8n for broad SaaS coverage, team use or source access.",
    updated: UPDATED,
    table: {
      columns: ["", "Mono Agent", "n8n"],
      rows: [
        ["License", "Monoes Proprietary Software License: free of charge for now, personal or internal business use; source not public", "Sustainable Use License (fair-code, source available, not OSI-approved)"],
        ["Account", "monoes.me sign-in required; keeps working up to 24 hours offline", "None for a self-hosted instance; account for n8n Cloud"],
        ["Install", "One static Go binary, embedded SQLite; no Docker needed", "Self-hosting requires Docker from n8n 3.0 (scheduled October 2026; npm installs end); hosted cloud available"],
        ["Integrations", "370+ node types, about 240 of them app integrations", "1,500+ integrations and thousands of community templates"],
        ["Triggers", "Manual, cron schedule, webhook, agent-org", "Hundreds of app-event and polling triggers"],
        ["Human approval", "Built-in node: reviewer can edit fields, then approve or reject; queue survives restarts", "Available through wait/form nodes"],
        ["AI agents", "stdio MCP server, JSON CLI; AI steps run on agent CLIs you already have (Claude Code, Codex and others) under their own login and plan, so no AI keys or credits", "AI agent nodes calling LLM APIs"],
        ["Team features", "None yet (no RBAC, SSO or multi-user)", "Users, RBAC, SSO and audit logs on paid plans"],
        ["Maturity", "Pre-1.0, single maintainer", "Mature, large community and company behind it"],
      ],
    },
    sections: [
      {
        heading: "Where Mono Agent is stronger",
        bullets: [
          "Nothing else to install: a single CGO-free binary (monoagentcli) with SQLite built in. No Node.js, Docker or external database is needed for the core engine. n8n 3.0 makes Docker a requirement for self-hosting (n8n 3.0 breaking-changes notes, docs.n8n.io).",
          "No AI credits and no AI keys: AI steps run through the agent CLI you already use (Claude Code, Codex, OpenCode and others), on that CLI's own login and plan.",
          "Human-in-the-loop is part of the engine: a run pauses, a reviewer edits the configured fields, then approves or rejects. The queue is durable across restarts and reachable from the CLI, desktop app, MCP and HTTP API.",
          "Built for AI agents to operate: --json output, documented exit codes, an offline manual (monoagentcli ref) and a stdio MCP server so Claude Code or Codex can create, validate and run workflows.",
          "Secrets are encrypted with AES-256-GCM and the key lives in your OS keychain, with separate vaults per profile.",
          "Can drive your real, logged-in Chrome through a paired extension instead of a separate automation profile.",
        ],
      },
      {
        heading: "Where n8n is stronger",
        bullets: [
          "Integration breadth: roughly 15x more integrations, plus app-event triggers Mono Agent does not have.",
          "Sub-workflows, workflow versioning and a step debugger - all on Mono Agent's roadmap, not shipped.",
          "Team and enterprise features, and a hosted cloud so no machine needs to stay on.",
          "A large community, forum and template library.",
          "Source you can read and modify under its fair-code license, and no sign-in for a self-hosted instance. Mono Agent's source is not public and it needs a monoes.me sign-in.",
        ],
      },
      {
        heading: "Which should you choose?",
        paragraphs: [
          "Choose Mono Agent if you are a developer or technical operator who wants automation that runs on your own machine, keeps data local, puts a human approval in front of outbound actions, and can be driven by AI coding agents through MCP or the CLI.",
          "Choose n8n if you need a specific SaaS integration Mono Agent lacks, want a hosted option, or are rolling automation out to a team. Mono Agent's own documentation says choosing n8n in that case is the correct decision.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Mono Agent a free n8n alternative?",
        answer:
          "It is free of charge for now, with no paid tier, but it is not open source: it ships under the Monoes Proprietary Software License, which allows personal and internal business use, and it needs a free monoes.me sign-in. You run it yourself on Linux, macOS or Windows, as a CLI or a desktop app.",
      },
      {
        question: "Does Mono Agent need Node.js like n8n?",
        answer:
          "The core workflow engine does not - it is a single static Go binary. The optional AI agent features delegate to Monomind, which runs on Node.js; Mono Agent can install a private Node runtime for that.",
      },
      {
        question: "Can I bring my n8n workflows to Mono Agent?",
        answer:
          "Yes. monoagentcli workflow import --from n8n my-flow.json converts an n8n workflow export and saves it, and prints a report: which nodes mapped, which apps to reconnect (n8n exports never contain credential secrets), and any node that still needs replacing, in which case it exits with code 3. workflow convert --from n8n previews the result without saving. Python Code nodes and the Git node are not carried over yet.",
      },
      {
        question: "Can AI agents build and run Mono Agent workflows?",
        answer:
          "Yes. monoagentcli mcp exposes workflow list, run, validate and human-approval actions over MCP, and every CLI command supports JSON output for scripting. monoagentcli setup registers the MCP server with --allow-mutations, so a connected agent can run workflows and approve human-review items; register it without that flag to keep it read-only.",
      },
    ],
    related: [{ label: "Mono Agent vs Make", href: "/compare/mono-agent-vs-make" }, ...MONO_AGENT_RELATED],
  },
  {
    slug: "mono-agent-vs-make",
    title: "Mono Agent vs Make.com: self-hosted automation without per-operation pricing",
    description:
      "Compare Mono Agent and Make.com: pricing model, data residency, app coverage, human approvals and who each tool is for.",
    summary:
      "Mono Agent is a free automation tool (proprietary license, free of charge for now) that runs on your own machine, so there are no per-operation charges and workflows don't run in a vendor's cloud; only the services and AI providers a workflow calls receive its data. Make is a polished hosted SaaS with thousands of apps, instant triggers and team features, billed by usage. Pick Mono Agent for local, developer-driven automation with human approvals; pick Make for no-ops cloud automation that non-technical teammates can build.",
    updated: UPDATED,
    table: {
      columns: ["", "Mono Agent", "Make"],
      rows: [
        ["Hosting", "Your laptop, desktop or server", "Vendor cloud (SaaS)"],
        ["Pricing", "Free of charge for now (proprietary license); AI steps run on your existing agent CLI plan, no credits", "Subscription plus usage-based credits; AI modules use a variable number of credits"],
        ["Data location", "Your machine, plus the APIs a workflow calls", "Processed in Make's cloud"],
        ["App catalog", "370+ node types", "Thousands of apps"],
        ["Always-on triggers", "Requires monoagentcli daemon running", "Runs 24/7 in the cloud"],
        ["Human approval", "Built-in, reviewer can edit before approving", "Via third-party or custom steps"],
        ["Scripting / AI agents", "CLI with JSON output, MCP server", "Web builder and API"],
      ],
    },
    sections: [
      {
        heading: "Where Mono Agent is stronger",
        bullets: [
          "No per-operation bill, so high-volume or loop-heavy workflows cost nothing extra.",
          "Local execution: useful for private data, offline steps and anything you don't want in a third-party cloud.",
          "Real DAGs with JavaScript code nodes, shell, SSH and direct Postgres, MySQL, MongoDB and Redis nodes.",
          "An approval step where the reviewer can edit the draft before it is sent.",
        ],
      },
      {
        heading: "Where Make is stronger",
        bullets: [
          "A much larger app catalog with instant app triggers.",
          "No machine to keep running; webhooks work from the internet without exposing a port.",
          "Visual builder aimed at non-developers, plus team and organization features.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is there an open-source alternative to Make.com?",
        answer:
          "n8n is the best-known self-hosted option, with source available under a fair-code license. Mono Agent is a self-hosted alternative but not open source: it is free of charge under a proprietary license and needs a monoes.me sign-in, with a visual canvas editor, a CLI and 370+ node types.",
      },
      {
        question: "Can Mono Agent receive webhooks from the internet?",
        answer:
          "Yes, but its webhook trigger binds to 127.0.0.1 by default, so you expose it yourself (reverse proxy or tunnel). Schedules and webhooks fire while monoagentcli daemon is running.",
      },
    ],
    related: [{ label: "Mono Agent vs Zapier", href: "/compare/mono-agent-vs-zapier" }, ...MONO_AGENT_RELATED],
  },
  {
    slug: "mono-agent-vs-zapier",
    title: "Mono Agent vs Zapier: free, scriptable local automation vs the easiest hosted option",
    description:
      "Compare Mono Agent and Zapier on pricing, integrations, branching logic, human approvals and technical requirements.",
    summary:
      "Zapier is the easiest hosted automation tool, with the largest app catalog and no infrastructure to run, priced per task. Mono Agent is a free alternative for technical users (proprietary license, free of charge for now): real branching DAGs, code, shell and database nodes, an editable human-approval step, and a CLI and MCP server that AI agents can drive, all running on your own machine. Its AI steps run on the agent CLI you already pay for, not on a task pool.",
    updated: UPDATED,
    table: {
      columns: ["", "Mono Agent", "Zapier"],
      rows: [
        ["Pricing", "Free of charge for now; AI runs on your agent CLI plan, no credits", "Per-task subscription tiers; AI steps draw from the task pool"],
        ["Setup", "Install a binary; some JSON and cron", "Browser only, no-code"],
        ["App catalog", "370+ node types", "Thousands of apps"],
        ["Logic", "DAG with if/switch/merge, JS code, shell, SSH, DB nodes", "Linear Zaps with paths and filters"],
        ["Data location", "Your machine", "Zapier cloud"],
      ],
    },
    sections: [
      {
        heading: "Who should pick which",
        paragraphs: [
          "Pick Zapier if you are non-technical, need a specific integration Mono Agent doesn't have, or don't want to keep a machine running.",
          "Pick Mono Agent if you are comfortable installing a CLI, want no per-task costs, need code or database steps, or want AI coding agents to build and operate your automations through MCP.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Mono Agent easier than Zapier?",
        answer:
          "No. Zapier is easier for non-developers. Mono Agent trades some ease of setup for local execution, zero per-task cost and full scriptability.",
      },
    ],
    related: [{ label: "Mono Agent vs n8n", href: "/compare/mono-agent-vs-n8n" }, ...MONO_AGENT_RELATED],
  },
  {
    slug: "monoes-vs-uipath",
    title: "Monoes vs UiPath: agentic process automation vs enterprise RPA",
    description:
      "How Monoes Workforce and Mono Agent compare with UiPath: approach, pricing, desktop RPA, document processing and which fits mid-market operations teams.",
    summary:
      "UiPath is an enterprise RPA platform built around recorded UI robots, desktop and Citrix automation, document understanding and a governed robot fleet. Monoes takes an agentic approach: Monoes Workforce deploys AI digital workers that run whole processes on the ERP, CRM and email you already use, under explicit approval policies, starting with a fixed-price Discovery audit. Pick UiPath for legacy desktop automation at enterprise scale; pick Monoes for API- and agent-driven back-office processes without an RPA program.",
    updated: UPDATED,
    table: {
      columns: ["", "Monoes", "UiPath"],
      rows: [
        ["Approach", "AI agents inside deterministic workflows with policy rules", "RPA robots replaying UI steps, plus AI add-ons"],
        ["Delivery", "Managed service (Workforce) or self-hosted tools (Mono Agent, free; Monomind, open source)", "Licensed platform, usually with an implementation partner"],
        ["Entry cost", "Discovery audit from $3,000, paid after delivery; SME Discovery from $15,000", "Enterprise licensing (contact sales)"],
        ["Desktop / Citrix apps", "Not supported", "Core strength"],
        ["Human oversight", "Five autonomy levels, approval policies, audit trail per action", "Attended robots, Action Center"],
        ["Best fit", "SMB and mid-market back-office teams", "Large enterprises with RPA centers of excellence"],
      ],
    },
    sections: [
      {
        heading: "How Monoes Workforce works",
        paragraphs: [
          "Every digital worker is built from four layers: a deterministic Workflow that fixes the steps, an Agent that reads, extracts and decides within a step, a Policy layer holding versioned rules such as 'invoices over $20,000 require approval', and Connectors to your ERP, CRM, email, spreadsheets, accounting and ticketing systems.",
          "Engagements run Discovery (1 day or 1 week) → Expand (1-3 months, running in parallel with your team at first) → Scale. Workers start at human-approval level and move toward autonomous execution only as measured accuracy earns it.",
        ],
      },
      {
        heading: "Where UiPath is the better choice",
        bullets: [
          "Automating legacy desktop, mainframe or Citrix applications with no API.",
          "High-volume document understanding and OCR pipelines.",
          "Organizations that already run an RPA center of excellence and need centralized orchestration of hundreds of robots.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Monoes a UiPath alternative for mid-market companies?",
        answer:
          "For processes that run through web systems and APIs - invoices, approvals, CRM follow-up, reconciliation, reporting - yes. Monoes Workforce is sold as a fixed-scope managed service rather than a platform license. It does not replace UiPath for desktop or Citrix automation.",
      },
      {
        question: "What does agentic automation do that RPA doesn't?",
        answer:
          "RPA replays fixed UI steps and breaks when inputs vary. Agentic automation uses an AI agent to read, classify and decide on unstructured inputs such as emails and invoices, while a deterministic workflow and policy layer keeps the process predictable and auditable.",
      },
    ],
    related: [
      { label: "Agentic automation vs RPA", href: "/guides/agentic-process-automation-vs-rpa" },
      { label: "Monoes Workforce", href: "/workforce" },
      { label: "All comparisons", href: "/compare" },
    ],
  },
];
