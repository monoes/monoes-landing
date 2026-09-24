import type { Guide } from "./types";

const UPDATED = "September 24, 2026";

const WORKFORCE_RELATED = [
  { label: "Monoes Workforce", href: "/workforce" },
  { label: "How it works", href: "/workforce/how-it-works" },
  { label: "All guides", href: "/guides" },
];

export const buyerGuides: Guide[] = [
  {
    slug: "ai-invoice-processing-accounts-payable",
    title: "AI digital workers for invoice processing and accounts payable",
    description:
      "How an AI digital worker automates invoice intake, vendor validation, PO matching, approvals and ERP posting - with approval policies and a full audit trail.",
    summary:
      "An AI accounts-payable worker reads incoming invoices, extracts the data, validates the vendor, matches the invoice to its purchase order, applies your approval rules and posts the result to your ERP. Monoes Workforce builds these workers on the ERP and email you already use, keeps deterministic policy rules (for example 'invoices over $20,000 require approval') separate from the AI, and logs every action for audit.",
    updated: UPDATED,
    sections: [
      {
        heading: "What the invoice process looks like",
        paragraphs: [
          "A typical AP worker runs the same steps every time: invoice received → extract document → validate vendor → match PO → decision rule (e.g. price variance under 5%) → human approval where policy requires it → ERP action.",
          "The AI agent only does the parts that need judgment - reading the invoice, extracting fields, classifying exceptions. The workflow fixes the order of steps and the policy layer decides what is allowed, so the process stays predictable and testable.",
        ],
      },
      {
        heading: "How approvals and oversight work",
        bullets: [
          "Level 1 - AI Copilot: the AI recommends, a human executes.",
          "Level 2 - AI executes with human approval on important actions.",
          "Level 3 - Autonomous execution of authorized work.",
          "Level 4 - Autonomous handling of selected exceptions.",
          "Workers start with approval and move up only as measured extraction, matching and exception rates justify it.",
        ],
      },
      {
        heading: "What it costs to start",
        paragraphs: [
          "Engagements begin with a Discovery audit: $3,000 for one process in one day, or $12,000 for a five-day multi-department audit. Typical pilots start at $15,000, with a fixed, itemized quote in the Discovery report.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can AI automate accounts payable without replacing our ERP?",
        answer:
          "Yes. The worker connects to your existing ERP, email and spreadsheets through connectors and posts results there. Your team keeps working in the same systems.",
      },
      {
        question: "How is this audited?",
        answer:
          "Every action the worker takes is logged, and approval rules are versioned policies kept separate from the AI's judgment, so auditors can see which rule applied to each invoice.",
      },
      {
        question: "Does it work for 3-way matching?",
        answer:
          "Yes. 3-way match (PO, goods receipt, invoice) is one of the standard procurement workers, alongside vendor management and PO tracking.",
      },
    ],
    related: [{ label: "AI inside your ERP and CRM", href: "/guides/ai-automation-inside-existing-erp-crm" }, ...WORKFORCE_RELATED],
  },
  {
    slug: "ai-crm-lead-follow-up",
    title: "Automating CRM lead follow-up with AI - without losing oversight",
    description:
      "How to automate lead follow-up with AI drafts and human approval, using a managed digital worker or the open-source Mono Agent.",
    summary:
      "The safe way to automate CRM lead follow-up is to let AI draft each message from the lead's record and history, put a human approval step in front of anything that gets sent, and write the outcome back to the CRM. Monoes offers two paths: Monoes Workforce runs this as a managed digital worker on your CRM, or you self-host the open-source Mono Agent, whose built-in approval node lets a reviewer edit the subject and body before sending.",
    updated: UPDATED,
    sections: [
      {
        heading: "The workflow",
        bullets: [
          "Trigger: a schedule picks up new or stale leads from your CRM or spreadsheet.",
          "Draft: an AI agent writes a follow-up using the lead's record and past messages.",
          "Approve: a human reviews, edits if needed, and approves or rejects.",
          "Send and record: the email goes out through Gmail or Outlook and the CRM row is updated.",
        ],
      },
      {
        heading: "Managed or self-hosted",
        paragraphs: [
          "Monoes Workforce's Sales & CRM workers cover lead follow-up, pipeline hygiene and quote generation, deployed and monitored for you.",
          "Mono Agent (free, MIT) ships HubSpot, Salesforce, Google Sheets, Gmail and Outlook nodes plus a human-in-the-loop node. It suits small volumes where every message is reviewed; it has no CRM-event triggers, so it runs on a schedule.",
        ],
      },
    ],
    faqs: [
      {
        question: "Will AI send emails to leads without approval?",
        answer:
          "Only if you allow it. Both paths default to human approval before sending, and autonomy is raised per step only when you decide.",
      },
    ],
    related: [{ label: "Mono Agent", href: "/projects/mono-agent" }, ...WORKFORCE_RELATED],
  },
  {
    slug: "ai-automation-inside-existing-erp-crm",
    title: "Business process automation that works inside your existing ERP and CRM",
    description:
      "How AI digital workers automate end-to-end processes on the ERP, CRM, email and spreadsheets you already run, without a system replacement project.",
    summary:
      "You don't need to replace your ERP or CRM to automate processes end-to-end. AI digital workers connect to the systems you already run - ERP, CRM, email, Excel/CSV, accounting and ticketing - through swappable connectors, and execute the whole process on top of them. Monoes Workforce builds workers this way for finance, procurement, HR, customer service, sales and reporting.",
    updated: UPDATED,
    sections: [
      {
        heading: "Why connectors instead of replacement",
        paragraphs: [
          "The process logic (workflow and policy) is kept separate from the connectors. When a system changes, you swap the connector without rewriting the process, and your team keeps using the screens they know.",
        ],
      },
      {
        heading: "Processes that fit well",
        bullets: [
          "Finance: invoice processing, bank reconciliation, AR collections, period close.",
          "Procurement: 3-way match, purchase approvals, vendor scorecards.",
          "HR: onboarding, document collection, leave approvals.",
          "Customer service: ticket triage, SLA monitoring, escalation routing.",
          "Sales: lead follow-up, pipeline hygiene, quote-to-order.",
          "Reporting: KPI monitoring, executive dashboards, ad-hoc reports.",
        ],
      },
    ],
    faqs: [
      {
        question: "Which systems can the workers connect to?",
        answer:
          "ERP, CRM, email, Excel/CSV, accounting and ticketing systems. Specific systems are confirmed during the Discovery audit.",
      },
      {
        question: "How long until the first worker is live?",
        answer:
          "Discovery takes 1-5 days and a pilot 3-6 weeks, during which the worker runs in parallel with your team before taking over.",
      },
    ],
    related: [{ label: "AI for accounts payable", href: "/guides/ai-invoice-processing-accounts-payable" }, ...WORKFORCE_RELATED],
  },
  {
    slug: "agentic-process-automation-vs-rpa",
    title: "What is agentic process automation, and how is it different from RPA?",
    description:
      "A plain-language explanation of agentic process automation (APA), how it differs from RPA and workflow tools, and when each approach fits.",
    summary:
      "Agentic process automation uses AI agents that can read, classify and decide on unstructured inputs - emails, invoices, requests - inside a deterministic workflow with explicit policy rules. Traditional RPA replays recorded UI steps and breaks when inputs or screens change; classic workflow tools move data between apps but can't make judgment calls. Agentic automation combines the two: agents for judgment, workflows and policies for control.",
    updated: UPDATED,
    table: {
      columns: ["", "RPA", "Workflow tools", "Agentic process automation"],
      rows: [
        ["Handles unstructured input", "Poorly", "No", "Yes"],
        ["Breaks when screens change", "Often", "No (uses APIs)", "No (uses APIs and agents)"],
        ["Makes judgment calls", "No", "No", "Yes, within policy"],
        ["Predictable and auditable", "Yes", "Yes", "Yes, when workflow and policy are separate from the agent"],
        ["Desktop / legacy apps", "Strong", "No", "Limited"],
      ],
    },
    sections: [
      {
        heading: "The four layers of a well-built agentic worker",
        bullets: [
          "Workflow - the deterministic controller that fixes the steps.",
          "Agent - the reasoning inside specific steps (read, extract, classify, decide).",
          "Policy - versioned rules for what's allowed, e.g. approval thresholds.",
          "Connector - the bridge to ERP, CRM, email and spreadsheets.",
        ],
      },
      {
        heading: "When to use which",
        paragraphs: [
          "Use RPA for legacy desktop applications with no API. Use a workflow tool (Zapier, Make, n8n, Mono Agent) for rule-based data movement between apps. Use agentic process automation when the process involves reading documents or messages and making decisions that used to need a person.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is agentic automation safe for finance processes?",
        answer:
          "It is when the agent can only act inside steps the workflow gives it, policy rules are deterministic and versioned, and important actions need human approval until accuracy is proven.",
      },
    ],
    related: [{ label: "Monoes vs UiPath", href: "/compare/monoes-vs-uipath" }, ...WORKFORCE_RELATED],
  },
  {
    slug: "local-ai-agent-memory-sqlite",
    title: "AI agent frameworks that store memory locally in SQLite",
    description:
      "How Monomind stores AI agent memory, embeddings, a code graph and documents in local SQLite instead of a cloud vector database - and what still leaves your machine.",
    summary:
      "Monomind (open source, Apache 2.0, npm install -g monomind) stores agent memory locally in SQLite: text plus embedding vectors in a local database, an HNSW index for fast search on larger stores, and embeddings computed on your machine with a local model (gte-modernbert-base via transformers.js) - no cloud vector database or API key. Its code knowledge graph and document index are local SQLite databases too. Other frameworks such as LangGraph (SQLite checkpointer) and CrewAI also support local storage.",
    updated: UPDATED,
    sections: [
      {
        heading: "What is stored locally",
        bullets: [
          "Agent memory: SQLite via better-sqlite3, with a pure-WASM sql.js fallback.",
          "Embeddings: 768-dimension vectors from a local model; semantic search with keyword fallback.",
          "Code graph: .monomind/monograph.db, built with tree-sitter and searched with FTS5.",
          "Documents: Markdown, TXT, PDF and DOCX indexed per project, plus a global brain in ~/.monomind/global-brain.",
        ],
      },
      {
        heading: "What still leaves your machine",
        bullets: [
          "Prompts your coding assistant sends to its model provider (e.g. Claude Code to Anthropic) - Monomind doesn't change that unless you configure a local model for an org role.",
          "A one-time download of the embedding model from HuggingFace.",
          "An npm update check (can be turned off) and opt-in features such as crash reports.",
          "Monomind documents every outbound request in its privacy notes, kept current by a test.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does Monomind need a vector database like Pinecone?",
        answer: "No. Vectors are stored in local SQLite and indexed with HNSW on your machine.",
      },
      {
        question: "Does it work offline?",
        answer:
          "Memory storage and keyword search work offline. Semantic search needs the embedding model, which is downloaded once and then runs locally.",
      },
    ],
    related: [
      { label: "Monomind", href: "/projects/monomind" },
      { label: "Monomind vs CrewAI", href: "/compare/monomind-vs-crewai" },
      { label: "All guides", href: "/guides" },
    ],
  },
];
