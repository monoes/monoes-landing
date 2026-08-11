export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogImage {
  src: string;
  alt: string;
  caption: string;
}

export interface BlogCodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface BlogQuote {
  text: string;
  author?: string;
}

export interface BlogSection {
  id: string;
  heading: string;
  subheading?: string;
  paragraphs: string[];
  image?: BlogImage;
  codeBlock?: BlogCodeBlock;
  quote?: BlogQuote;
  keyTakeaways?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: BlogAuthor;
  tags: string[];
  featured?: boolean;
  coverImage: BlogImage;
  content: {
    introduction: string[];
    sections: BlogSection[];
    conclusion: string[];
  };
}

export const BLOG_POSTS: BlogPost[] = [
  // --- 5 REAL RELEASE ARTICLES (chronological) ---
  {
    slug: "monomind-v22-org-runtime-v2",
    title: "Monomind v2.2: Org Runtime v2 — Real Agent Sessions, Not Scripted Prompts",
    subtitle: "A daemon-hosted architecture where every role in an org is a live, provider-backed agent session, governed by an in-process policy engine and streamed over an append-only event bus.",
    excerpt: "Monomind v2.2 replaces the old prompt-orchestrated org flow with Org Runtime v2: a persistent OrgDaemon that hosts real agent sessions per role, connected by an append-only OrgBus event log and gated by a per-role PolicyEngine.",
    date: "July 17, 2026",
    readTime: "8 min read",
    featured: false,
    tags: ["Release", "v2.2", "Org Runtime", "Monomind"],
    author: {
      name: "Monoes Team",
      role: "Monomind Core",
      avatar: "/images/monkey/welcoming-arms.png",
    },
    coverImage: {
      src: "/images/blog/agent-network-architecture.jpg",
      alt: "Abstract network diagram of interconnected agent nodes feeding into a central daemon process",
      caption: "Org Runtime v2: a single OrgDaemon process hosting multiple orgs, each with independently governed role sessions connected by a shared event bus.",
    },
    content: {
      introduction: [
        "Earlier versions of Monomind's org feature worked by having a single Claude Code boss agent, running under the Task tool, prompt its way through a org's roles and manually post updates to a dashboard. It worked, but every role's behavior lived inside one shared prompt context, and there was no structural boundary between what one role could see, call, or spend versus another.",
        "Monomind v2.2, released July 17, 2026, replaces that flow with Org Runtime v2. The core change is architectural: each role in an org is now a real, independently-running provider-backed agent session, hosted inside a long-lived OrgDaemon process, coordinated through an append-only event log, and constrained by a per-role policy engine. This post walks through the three pieces that make that possible.",
      ],
      sections: [
        {
          id: "orgdaemon-and-real-sessions",
          heading: "1. OrgDaemon: One Process, Many Orgs, Real Sessions",
          subheading: "Every role is a live agent session, not a scripted turn in a shared prompt",
          paragraphs: [
            "At the center of Org Runtime v2 is OrgDaemon, a process that can host multiple orgs concurrently. Each org is defined by a config file at .monomind/orgs/<name>.json, and each role within that config gets its own agent session — a real, provider-backed session, not a simulated or scripted stand-in inside a shared conversation.",
            "The execution path for a role is straightforward: runAgentSession() sets up the session, hands off to runOneSession() to run a single turn, which in turn calls into the underlying runner's run() method to actually talk to the provider. Because each role's session is a distinct object with its own state, one role's context window, tool calls, and conversation history never bleed into another's.",
            "This matters because it's what makes the rest of the system — the event bus, the mailbox, the policy engine — possible in the first place. You can't govern or audit a role's behavior if that role doesn't have a clean, separately addressable execution context.",
          ],
          image: {
            src: "/images/blog/art1-multi-agent-dag.jpg",
            alt: "Diagram showing a central daemon process branching into several independent agent session nodes, each labeled with a distinct role",
            caption: "Each role defined in an org config becomes its own provider-backed agent session inside the OrgDaemon process — no shared prompt context between roles.",
          },
          codeBlock: {
            filename: ".monomind/orgs/sample-team.json",
            language: "json",
            code: `{
  "name": "sample-team",
  "roles": [
    {
      "name": "lead",
      "provider": "claude-code",
      "policy": {
        "tools": { "allow": ["Read", "Edit", "Bash"] }
      }
    },
    {
      "name": "reviewer",
      "provider": "claude-code",
      "policy": {
        "tools": { "allow": ["Read"] }
      }
    }
  ]
}`,
          },
          keyTakeaways: [
            "OrgDaemon hosts multiple orgs in a single long-lived process.",
            "Each role gets its own real, provider-backed agent session — not a scripted turn inside a shared prompt.",
            "Session execution flows through runAgentSession() → runOneSession() → runner.run().",
          ],
        },
        {
          id: "orgbus-and-mailbox",
          heading: "2. OrgBus and Mailbox: How Roles Actually Communicate",
          subheading: "An append-only event log replaces the old dashboard curl posts",
          paragraphs: [
            "In the v1 flow, keeping a dashboard in sync meant the boss agent manually curl-posting status updates as it went. Org Runtime v2 removes that entirely. Every meaningful event in an org's lifecycle — a role starting, a message being sent, a tool call happening — is written to OrgBus, an append-only JSONL event log with in-process fanout.",
            "Because OrgBus is append-only, both the dashboard and any historical view of the org are reading from the same source of truth: nothing is summarized or re-derived after the fact. Messages between roles are delivered through a per-role Mailbox, so a role only ever sees the messages actually addressed to it, rather than the full firehose of the org's activity.",
            "The dashboard itself runs on port 4242 and is auto-launched by a Claude Code SessionStart hook — there's no separate CLI command to start it. It discovers running daemons through .monomind/control.json, which is how it finds the right OrgBus stream to tail.",
          ],
          image: {
            src: "/images/blog/art1-live-telemetry.jpg",
            alt: "Live telemetry-style visualization of an append-only event stream feeding multiple downstream consumers",
            caption: "OrgBus writes every org event to an append-only JSONL log with in-process fanout — the dashboard and history views both read from this single stream.",
          },
          codeBlock: {
            filename: "orgbus-event.jsonl",
            language: "json",
            code: `{"ts":"2026-07-17T14:02:31Z","org":"sample-team","role":"lead","type":"message.sent","to":"reviewer"}
{"ts":"2026-07-17T14:02:33Z","org":"sample-team","role":"reviewer","type":"session.started"}`,
          },
          keyTakeaways: [
            "OrgBus is an append-only JSONL event log with in-process fanout — the single source of truth for org activity.",
            "Per-role Mailbox delivers only the messages addressed to that role.",
            "The dashboard on :4242 is auto-launched by a SessionStart hook and discovers daemons via .monomind/control.json.",
          ],
        },
        {
          id: "policy-engine-and-migration",
          heading: "3. PolicyEngine: In-Process Governance, and Migrating from v1",
          subheading: "Tool limits, file scope, web access, and token budgets — enforced per role, with an audit trail",
          paragraphs: [
            "Each role session in Org Runtime v2 runs behind its own PolicyEngine. This is real, in-process enforcement, not documentation of intended behavior: tool allow/deny lists, file scope restrictions, web access control, and token budget caps are all checked before a role's session is permitted to act, and every decision is written to an audit trail.",
            "This is a direct consequence of the OrgDaemon architecture — because each role is a distinct session rather than a turn inside one shared prompt, the policy engine has a clean boundary to attach to. A role restricted to Read-only tools genuinely cannot invoke Edit or Bash; there's no shared context for it to reach around the restriction through.",
            "The old v1 flow — the Task-tool boss agent driving everything through prompts and manual dashboard posts — is now legacy. It's still reachable via /mastermind:runorgv1 for org configs that haven't been migrated yet, and the org migrate command converts v1 configs into the v2 shape shown earlier in this post.",
          ],
          image: {
            src: "/images/blog/art1-audit-queue.jpg",
            alt: "Queue-style visualization of policy decisions being logged in sequence, each tagged with a role and an allow or deny outcome",
            caption: "Every PolicyEngine decision — tool call, file access, web request, budget check — is written to a per-role audit trail.",
          },
          quote: {
            text: "Governance has to live inside the session boundary, not around it — otherwise it's just a label on a config file.",
            author: "Monomind Core Team",
          },
          keyTakeaways: [
            "PolicyEngine enforces tool allow/deny lists, file scope, web access, and token budget caps per role, with a full audit trail.",
            "Policy enforcement is possible precisely because each role runs as a separate real session, not a shared prompt turn.",
            "The v1 flow is legacy, reachable via /mastermind:runorgv1; org migrate converts v1 configs to v2.",
          ],
        },
      ],
      conclusion: [
        "Org Runtime v2 didn't add new prompts or new marketing surface area to Monomind's org feature — it replaced the execution model underneath it. Real per-role sessions, an append-only event bus, and in-process policy enforcement are the foundation every org run has been built on since v2.2. Monomind is Apache-2.0 licensed and available on GitHub.",
      ],
    },
  },
  {
    slug: "monomind-v23-local-memory-engine",
    title: "Monomind 2.3.1: Removing LanceDB, Going Local-First for Memory",
    subtitle: "600MB of native vector-DB dependencies out, local SQLite and in-process embeddings in",
    excerpt: "In the 2.3.1 release, monomind fully removed its LanceDB vector backend in favor of local SQLite storage and local MiniLM embeddings via transformers.js — no cloud vector database, no API key, no native binary bloat.",
    date: "July 18, 2026",
    readTime: "5 min read",
    author: {
      name: "Monoes Team",
      role: "Monomind Core",
      avatar: "/images/monkey/welcoming-arms.png",
    },
    tags: ["Release", "v2.3", "Memory", "Local-First"],
    featured: false,
    coverImage: {
      src: "/images/blog/gemini_1786439651_0.png",
      alt: "A single embedded database file glowing on a local machine, replacing a large disconnected cloud vector database stack",
      caption: "2.3.1 replaces a cloud-shaped vector database dependency with a single local SQLite file.",
    },
    content: {
      introduction: [
        "Monomind's memory system used to depend on LanceDB — an embedded vector database shipped via @lancedb/lancedb and apache-arrow. It worked, but it carried roughly 600MB of native dependencies, which made installs heavier and cross-platform builds more fragile than they needed to be.",
        "In the 2.3.1 release (July 18, 2026), we removed LanceDB entirely. Memory storage now runs on local SQLite, with local embeddings computed in-process. Nothing about how memory is used changed — what changed is what's running underneath it.",
      ],
      sections: [
        {
          id: "why-remove-lancedb",
          heading: "Why LanceDB had to go",
          subheading: "Native dependency weight without a matching payoff for a local-first tool",
          paragraphs: [
            "LanceDB gave monomind a working vector store early on, but it came bundled with apache-arrow and native binaries that added significant install weight — around 600MB — for a tool meant to run comfortably on a developer's own machine.",
            "For a project whose whole premise is local-first operation, a heavy native dependency chain is friction: slower installs, more platform-specific failure modes, and a bigger attack surface to keep updated. 2.3.1 removes that dependency chain outright rather than trying to slim it down.",
          ],
          image: {
            src: "/images/blog/gemini_1786439694_0.png",
            alt: "A stack of heavy native library blocks (labeled vector DB, Arrow) being lifted away from a lightweight local application core",
            caption: "LanceDB and apache-arrow are gone — no native vector-DB dependency chain remains in the memory backend.",
          },
          keyTakeaways: [
            "LanceDB (@lancedb/lancedb + apache-arrow) is fully removed as of 2.3.1",
            "That dependency chain accounted for roughly 600MB of native install weight",
          ],
        },
        {
          id: "sqlite-and-local-embeddings",
          heading: "SQLite storage, local embeddings",
          subheading: "Text and vectors live in one local database file",
          paragraphs: [
            "In place of LanceDB, monomind now stores memory text and embedding vectors in local SQLite, using better-sqlite3 as the primary driver. Where native SQLite binaries can't load — certain platform or environment combinations — monomind falls back to sql.js, a WASM build of SQLite, to keep memory working without a native compile step.",
            "Embeddings themselves are computed locally too: monomind runs MiniLM/HuggingFace models in-process via transformers.js. There's no call out to a hosted embeddings API and no API key required to generate them — the model runs on your own hardware, on your own data.",
            "There's also a pure-JS HNSW vector index in the codebase, but it's worth being precise about what it is: a dormant fallback path, used only if native SQLite binary loading fails on a given system. It is not the active index and not a co-equal part of the standard retrieval path — SQLite is.",
          ],
          codeBlock: {
            language: "bash",
            code: `# store and retrieve memory using local SQLite + local embeddings — no external services
npx monomind@latest memory store --key "pattern-auth" --value "JWT with refresh tokens" --namespace patterns
npx monomind@latest memory search --query "authentication patterns" --namespace patterns
npx monomind@latest memory stats`,
            filename: "terminal",
          },
          image: {
            src: "/images/blog/gemini_1786439733_0.png",
            alt: "A small local server rack with a single database icon and an embedding model running entirely on-device, no cloud connection lines",
            caption: "Text and embedding vectors are stored together in local SQLite; embeddings are computed on-device via transformers.js.",
          },
          keyTakeaways: [
            "Primary backend: local SQLite (better-sqlite3), with sql.js WASM as a cross-platform fallback",
            "Embeddings run locally via MiniLM/HuggingFace models through transformers.js — no API key needed",
            "The pure-JS HNSW index exists only as a dormant fallback for native SQLite load failures, not the active index",
          ],
        },
        {
          id: "retrieval-and-package",
          heading: "How retrieval works now",
          subheading: "Dense embeddings plus lexical search, and a standalone package",
          paragraphs: [
            "Retrieval in monomind combines dense embedding similarity with lexical BM25 search, fusing the two so memory search can match on both semantic meaning and exact keywords. This logic sits on top of the SQLite-backed storage described above.",
            "The underlying memory engine is also published independently as @monoes/memory on npm (currently at v1.0.14), for anyone who wants the storage and embedding layer outside of the full monomind CLI.",
            "Monomind itself is Apache-2.0 licensed. That hasn't changed with this release — only the memory backend has.",
          ],
          image: {
            src: "/images/blog/gemini_1786439785_0.png",
            alt: "Two search paths — a semantic embedding path and a keyword/lexical search path — converging into one local result set",
            caption: "Memory search fuses dense embedding similarity with lexical BM25 matching over the same local SQLite store.",
          },
          quote: {
            text: "Removing LanceDB wasn't about chasing a benchmark — it was about matching the dependency footprint to what a local-first tool should actually require.",
            author: "Monomind Core Team",
          },
          keyTakeaways: [
            "Retrieval fuses dense embedding search with lexical BM25 matching",
            "The memory engine is also available standalone as @monoes/memory (npm, v1.0.14)",
            "Monomind is Apache-2.0 licensed",
          ],
        },
      ],
      conclusion: [
        "2.3.1 is a backend migration, not a new feature — LanceDB is out, local SQLite and in-process embeddings are in. The result is a lighter, more portable memory system with no cloud vector database and no API key in the loop.",
        "This release is also the foundation for what comes next: later 2.3.x and 2.4/2.5 releases build the Second Brain document-knowledge features on top of this same local storage layer — that's a story for the next post.",
      ],
    },
  },
  {
    slug: "monomind-v25-second-brain",
    title: "Second Brain: A Local Knowledge Base That Reads Your Docs So You Don't Have To",
    subtitle: "How monomind v2.5 turns your project's Markdown, PDFs, and Office files into semantic search results the model can actually use",
    excerpt: "monomind's Second Brain indexes your project's documents into a local, semantic search engine and injects the most relevant excerpts into every prompt — no manual retrieval, no cloud calls beyond a one-time model download, and a CI-enforced 80% recall bar to keep it honest.",
    date: "July 18, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["Release", "v2.5", "Second Brain", "RAG"],
    author: { name: "Monoes Team", role: "Monomind Core", avatar: "/images/monkey/welcoming-arms.png" },
    coverImage: {
      src: "/images/blog/gemini_1786353879_0.png",
      alt: "Abstract visualization of documents flowing into a searchable knowledge index",
      caption: "Second Brain turns a folder of project documents into a locally searchable knowledge base.",
    },
    content: {
      introduction: [
        "Most of what a coding agent needs to know isn't in the code — it's in the README nobody reread, the PDF spec someone attached to a ticket, the design doc buried three folders deep. monomind v2.5 ships Second Brain, a local document knowledge base that indexes those files and retrieves the relevant pieces automatically, on every prompt.",
        "It's not a new UI to learn or a workflow to remember. If your project has documents in it, Second Brain activates on `monomind init` and starts working in the background.",
      ],
      sections: [
        {
          id: "how-it-works",
          heading: "Ingest once, retrieve automatically",
          subheading: "From raw files to heading-aware chunks",
          paragraphs: [
            "Second Brain reads across roughly 19 file extensions — Markdown, TXT, PDF, DOCX, EPUB, and other common formats. Google Drive files are exported to Office formats before ingestion so they go through the same pipeline as everything else.",
            "As of 2.3.2, chunking is heading-aware: instead of slicing documents into arbitrary fixed-length blocks, it splits along document structure, which keeps related content together and makes individual chunks more meaningful as retrieval units.",
            "You can drive ingestion directly with the CLI, or let a hook do it per-prompt: a retrieval step pulls the top relevant excerpts and injects them as `[SECOND_BRAIN]` context before the model responds. The always-on dashboard keeps that retrieval path warm, with lookups landing around 60ms.",
          ],
          image: {
            src: "/images/blog/gemini_1786439826_0.png",
            alt: "Documents of different formats being chunked and organized by heading structure",
            caption: "Heading-aware chunking, added in 2.3.2, keeps related content together instead of splitting on arbitrary boundaries.",
          },
          codeBlock: {
            language: "bash",
            code: `# Ingest a document into the project's knowledge base
monomind doc ingest ./docs/architecture.pdf

# Search it directly from the CLI
monomind doc search --query "how does retrieval merge project and global results"

# List everything currently indexed
monomind doc list`,
            filename: "terminal",
          },
          keyTakeaways: [
            "Second Brain activates automatically on `monomind init` when documents are present — no manual setup",
            "Roughly 22 supported file extensions, including Markdown, TXT, PDF, DOCX, and EPUB",
            "Heading-aware chunking (since 2.3.2) keeps document structure intact in each retrieved chunk",
            "A per-prompt hook injects top-matching excerpts as `[SECOND_BRAIN]` context automatically",
          ],
        },
        {
          id: "global-brain",
          heading: "One brain per project, one brain for everything",
          subheading: "Project and global knowledge, merged at query time",
          paragraphs: [
            "Every project gets its own local index, but monomind also maintains a global, cross-project brain at `~/.monomind/global-brain` (the location is configurable via `MONOMIND_GLOBAL_BRAIN_DIR`). It's deliberately kept as a sibling of the per-project store, so it's never accidentally swept up by `cleanup --data`.",
            "Ingesting a path outside the current project routes to the global brain automatically — there's no separate command to remember. At query time, retrieval merges results from both stores: when a project result and a global result tie, the project result wins, and global hits are labeled `[global]` so you always know where an excerpt came from.",
            "For programmatic access, the MCP server exposes `knowledge_search` (which accepts a `store: \"project\" | \"global\"` filter when you want to search just one), plus `knowledge_ingest` and `knowledge_remove` for adding and retracting documents. `knowledge_remove` hides a document from search immediately and is reversible by re-ingesting it. Telemetry about queries — never prompt text — is logged locally to `.monomind/metrics/second-brain.jsonl`.",
          ],
          image: {
            src: "/images/blog/gemini_1786353959_0.png",
            alt: "Two interconnected knowledge stores, one local and one shared across projects, merging into a single search result",
            caption: "Project and global knowledge stores are queried together, with project results winning ties and global hits clearly labeled.",
          },
          quote: {
            text: "Retrieval merges project and global stores automatically — project wins ties, global hits are labeled [global] — so you never have to remember which brain you're searching.",
            author: "Monomind Core Team",
          },
          keyTakeaways: [
            "Global brain lives at ~/.monomind/global-brain, kept separate from project data on purpose",
            "Ingesting a path outside the project routes to the global brain automatically",
            "Retrieval merges both stores; project results win ties, global hits are labeled [global]",
            "MCP tools: knowledge_search (with a store filter), knowledge_ingest, knowledge_remove",
          ],
        },
        {
          id: "quality-and-privacy",
          heading: "Measured, not just marketed",
          subheading: "A CI-enforced recall bar and a single outbound call",
          paragraphs: [
            "It's easy to ship a search feature and never check whether it actually finds the right thing. monomind maintains a paraphrase golden-set eval — a fixed set of query/document pairs phrased differently than the source text — and enforces an 80% recall bar in CI. If retrieval quality regresses below that bar, the build fails.",
            "On the network side, Second Brain's only outbound call is a one-time fetch of the embedding model (roughly 90MB) from HuggingFace the first time you index a document. After that, indexing and retrieval run locally.",
            "The full CLI surface is under `monomind doc`, with subcommands for ingest, search, list, export, remove, reconcile, and eval — so you can inspect, audit, and re-run quality checks against your own indexed documents at any time.",
          ],
          image: {
            src: "/images/blog/gemini_1786439974_0.png",
            alt: "A quality gate checkmark next to a search results panel, representing an automated evaluation bar",
            caption: "An 80% recall bar on a paraphrase golden-set eval is enforced in CI before changes to retrieval ship.",
          },
          codeBlock: {
            language: "json",
            code: `{
  "tool": "knowledge_search",
  "arguments": {
    "query": "how is the global brain kept separate from cleanup --data",
    "store": "global"
  }
}`,
            filename: "mcp-call.json",
          },
          keyTakeaways: [
            "80% recall bar on a paraphrase golden-set eval is enforced in CI",
            "The embedding model (~90MB) is fetched once from HuggingFace on first index — the feature's only outbound call",
            "monomind doc supports ingest, search, list, export, remove, reconcile, and eval",
            "monomind is Apache-2.0 licensed",
          ],
        },
      ],
      conclusion: [
        "Second Brain doesn't ask you to change how you work — it activates when documents show up in your project and stays out of the way otherwise. Local indexing, a merged project/global search, a CI-enforced recall bar, and one clearly-scoped outbound network call: that's the whole feature.",
        "If you're running monomind v2.5 or later, run monomind doc list to see what's already indexed, or monomind doc ingest a file and try a search.",
      ],
    },
  },
  {
    slug: "monomind-v28-antigravity-multiplatform",
    title: "monomind 2.8.0: Google Antigravity Support Arrives",
    subtitle: "monomind grows up into a genuinely multi-platform agent CLI",
    excerpt: "monomind 2.8.0 adds native Google Antigravity support — GEMINI.md, .gemini rules, helper scripts, and a status bar integration — generated by default from monomind init, alongside opt-in opencode and Kimi Code support.",
    date: "July 31, 2026",
    readTime: "4 min read",
    featured: false,
    tags: ["Release", "v2.8", "Antigravity", "Multi-Platform"],
    author: {
      name: "Monoes Team",
      role: "Monomind Core",
      avatar: "/images/monkey/welcoming-arms.png",
    },
    coverImage: {
      src: "/images/blog/gemini_1786354047_0.png",
      alt: "Developer terminal showing monomind init generating configuration files for multiple AI coding platforms",
      caption: "monomind init now speaks Antigravity by default.",
    },
    content: {
      introduction: [
        "monomind started as a CLI and MCP server built around Claude Code. With 2.8.0, that changes in a meaningful way: monomind now generates native, working configuration for Google Antigravity out of the box, and the underlying provider system took its first real step toward supporting non-Anthropic model backends.",
        "This release isn't about adding a flag behind a feature gate — Antigravity is now the default output of monomind init. If you're on Claude Code, opencode, or Kimi Code, nothing changes for you. If you're on Antigravity, monomind now understands your editor natively.",
      ],
      sections: [
        {
          id: "why-antigravity",
          heading: "Why Antigravity, and why default",
          subheading: "Multi-platform is a first-class goal, not an afterthought",
          paragraphs: [
            "monomind is fundamentally a CLI plus an MCP server — the same core plugs into any editor or agent platform that speaks MCP. Claude Code has always been the primary, best-supported target, but the project has steadily added others: opencode, Kimi Code, and now Google Antigravity.",
            "Antigravity gets first-class treatment in 2.8.0 rather than an opt-in flag like opencode (--opencode) or Kimi Code (--kimicode). Running monomind init with no platform flags now produces Antigravity-native files automatically: a GEMINI.md project brief, a .gemini/rules/ directory, helper scripts under .gemini/helpers/statusline.*, and a .gemini/settings.json that wires it all together.",
          ],
          image: {
            src: "/images/blog/gemini_1786440020_0.png",
            alt: "Split view of configuration files generated for different AI coding editors from a single CLI command",
            caption: "One init command, editor-native output — GEMINI.md, .gemini/rules/, and settings.json for Antigravity.",
          },
          keyTakeaways: [
            "Antigravity config generation is monomind init's default behavior, not a flag",
            "opencode and Kimi Code remain additive opt-in flags (--opencode, --kimicode)",
            "Generated files include GEMINI.md, .gemini/rules/, .gemini/helpers/statusline.*, and .gemini/settings.json",
          ],
        },
        {
          id: "status-bar-and-providers",
          heading: "A status bar, and new provider kinds under the hood",
          paragraphs: [
            "Beyond config files, Antigravity users get a status bar integration through the generated helper scripts — a small but concrete piece of editor-native tooling that reflects what monomind is doing as you work.",
            "On the org runtime side, 2.8.0 introduces gemini and openai as provider kinds. It's worth being precise about what that means: these are authentication and environment kinds — for example, wiring up a GEMINI_API_KEY — not a dedicated Gemini execution runner. There is no GeminiAgentRunner in this release. What did land alongside the provider kinds is the Antigravity execution runner itself. monomind's set of execution runners (Claude, opencode, Kimi Code, Vercel AI SDK, Codex, and Antigravity) has been built up incrementally across releases; 2.8.0 is the release where Antigravity's runner and the gemini/openai provider kinds arrived, not the release where all of them shipped at once.",
          ],
          codeBlock: {
            language: "bash",
            filename: "terminal",
            code: `# Default: generates Antigravity-native config (GEMINI.md, .gemini/rules/, .gemini/settings.json)
monomind init

# Opt in to opencode config alongside the default output
monomind init --opencode

# Opt in to Kimi Code config alongside the default output
monomind init --kimicode`,
          },
          image: {
            src: "/images/blog/gemini_1786439933_0.png",
            alt: "Terminal status bar widget showing live monomind activity inside an editor",
            caption: "The Antigravity status bar integration, generated from .gemini/helpers/statusline.*.",
          },
          quote: {
            text: "Antigravity's runner and the new gemini/openai provider kinds are the concrete pieces that shipped in 2.8.0 — everything else on the multi-platform roadmap keeps building from here.",
            author: "Monomind Core Team",
          },
        },
        {
          id: "whats-next",
          heading: "What this means if you're not on Antigravity",
          paragraphs: [
            "If you're using Claude Code, opencode, or Kimi Code, this release changes nothing about your workflow — monomind init still produces the same output it always has for you, gated behind the same flags.",
            "For teams standardizing on Google's editor, 2.8.0 is the first release where monomind treats Antigravity as a peer to Claude Code rather than an edge case, and it sets up the provider layer for further non-Anthropic backend work down the line.",
          ],
          image: {
            src: "/images/blog/gemini_1786440460_0.png",
            alt: "Diagram-style illustration of a single CLI connecting to multiple editor icons via MCP",
            caption: "monomind's MCP core stays the same across every editor it supports.",
          },
          keyTakeaways: [
            "gemini/openai provider kinds configure auth and environment, not a new agent runner",
            "The Antigravity execution runner shipped in 2.8.0; the other runners arrived across earlier and later releases",
            "monomind is Apache-2.0 licensed",
          ],
        },
      ],
      conclusion: [
        "2.8.0 is a focused release: real Antigravity support, generated by default, plus the provider groundwork for more backends to come. Nothing here is speculative — it's the config files, helper scripts, and runner code monomind actually ships.",
        "If you install monomind fresh today, run monomind init and you'll see the Antigravity files land automatically. Add --opencode or --kimicode if you need those platforms too.",
      ],
    },
  },
  {
    slug: "monomind-v29-hardening-review-swarm",
    title: "Monomind 2.9.0: A Review-and-Hardening Release",
    subtitle: "233 files, ~92,000 lines, 28 fixes, and a test suite that finally hits zero failures",
    excerpt: "Monomind 2.9.0 is the result of a full internal audit: a 7-agent review swarm went through 233 files (~92,000 lines), fixed 28 issues with regression tests, filed 11 more as tracked GitHub issues, and took the test suite from 820 passing / 13 failing to 884 passing / 0 failing.",
    date: "August 6, 2026",
    readTime: "7 min read",
    author: {
      name: "Monoes Team",
      role: "Monomind Core",
      avatar: "/images/monkey/welcoming-arms.png",
    },
    tags: ["Release", "v2.9", "Security", "Reliability"],
    featured: true,
    coverImage: {
      src: "/images/blog/gemini_1786439547_0.png",
      alt: "Abstract visualization of a code review pipeline scanning through layers of source files",
      caption: "A full-codebase review pass: 233 files, roughly 92,000 lines, audited end to end.",
    },
    content: {
      introduction: [
        "Monomind 2.9.0 isn't a feature release in the usual sense. It's a hardening release: we pointed a 7-agent review swarm at the entire CLI package — 233 files, approximately 92,000 lines — and had it look for bugs, security gaps, and reliability holes rather than new capabilities.",
        "That process turned up 39 issues total. We fixed 28 of them in this release, each with a regression test so they can't silently come back. The remaining 11 were lower-priority or needed more design work, so they're filed as GitHub issues #62 through #73 for future releases.",
        "The test suite tells the same story in numbers: before this work it was 820 passing and 13 failing. It's now 884 passing and 0 failing.",
      ],
      sections: [
        {
          id: "how-the-review-worked",
          heading: "How the review swarm actually works",
          subheading: "In-process coordination, not a distributed system",
          paragraphs: [
            "It's worth being precise about what \"7-agent review swarm\" means here, because the term invites the wrong mental model. Monomind's swarm and hive-mind coordination system is explicitly experimental and in-process: it runs multiple Claude Code agents inside one process on one machine, coordinated by CLI-tracked state. There's no networking between separate machines, and no real distributed system underneath it.",
            "The \"consensus\" strategies — including the one labeled raft — are in-process vote-count thresholds among those agents, not real Raft leader election or log replication. That's a meaningful distinction: it means the review swarm is a structured way of running several focused audit passes over the same codebase and reconciling their findings by majority vote, not a fault-tolerant distributed review network.",
            "For this release, that in-process coordination pattern was pointed at the codebase itself — each agent auditing different files and classes of issue, with findings reconciled and then fixed with accompanying regression tests.",
          ],
          image: {
            src: "/images/blog/gemini_1786439887_0.png",
            alt: "Multiple parallel review threads converging on a single shared codebase diagram",
            caption: "Several in-process review passes over the same codebase, reconciled by majority vote — not a distributed consensus protocol.",
          },
          keyTakeaways: [
            "7 agents audited 233 files (~92,000 lines) in one coordinated in-process pass",
            "Swarm/hive-mind coordination is in-process only — no cross-machine networking",
            "\"Consensus\" here means vote-count thresholds, not leader election or log replication",
          ],
        },
        {
          id: "security-and-robustness-fixes",
          heading: "What actually got fixed",
          subheading: "Security hardening and crash-safety, not new features",
          paragraphs: [
            "On the security side: a command-injection vulnerability in cap-documents.ts was fixed. The terminal_execute tool is now an explicit opt-in gate rather than something available by default. The dashboard and org server now bind to 127.0.0.1 only, instead of listening on all interfaces. Crash-reporter output redaction was hardened so secrets and PII scrubbing is actually reliable rather than nominally implemented. And a fast-uri CVE was patched via a dependency bump.",
            "On the robustness side: state writes are now atomic, which prevents corruption if the process crashes mid-write. SQLite's busy_timeout is set to 5000ms to handle concurrent access without immediate failures. Git operations now carry a 30000ms timeout instead of hanging indefinitely. And an approval mutex was added to close a race condition in the approval flow.",
            "Two smaller but practical additions round out the release: monomind init now writes a runnable .monomind/orgs/sample-team.json, so a new install has a working example immediately instead of an empty config. The CLI statusline also gained a staleness indicator for the monograph knowledge graph, and a global Documents dashboard tab was added.",
          ],
          codeBlock: {
            language: "json",
            filename: ".monomind/orgs/sample-team.json",
            code: `{
  "name": "sample-team",
  "description": "Runnable starter org created by monomind init",
  "agents": [
    { "id": "coder", "type": "coder" },
    { "id": "reviewer", "type": "reviewer" },
    { "id": "tester", "type": "tester" }
  ]
}`,
          },
          quote: {
            text: "The goal wasn't new features. It was making sure the code we already shipped does what we said it does — and fixing it, with a test, when it didn't.",
            author: "Monomind Core Team",
          },
          keyTakeaways: [
            "Command-injection fix in cap-documents.ts; terminal_execute is now opt-in, not default",
            "Dashboard and org server now bind to 127.0.0.1 only",
            "Atomic state writes, 5000ms SQLite busy_timeout, 30000ms git timeout, and an approval mutex",
          ],
        },
        {
          id: "by-the-numbers",
          heading: "By the numbers, and what's next",
          subheading: "28 fixed, 11 filed, 0 failing tests",
          paragraphs: [
            "The net result: 28 of the 39 issues found were fixed in 2.9.0, each backed by a regression test. The other 11 were judged lower-priority or needing further design and are tracked as GitHub issues #62 through #73, so they're visible and won't get lost.",
            "The test suite moved from 820 passing / 13 failing to 884 passing / 0 failing — 64 new tests added along the way, mostly covering the 28 fixes directly.",
            "Monomind remains Apache-2.0 licensed. One more thing worth knowing if you haven't looked at it before: crash reporting is on by default, not opt-in. If a tool hard-crashes, monomind can file a GitHub issue on that tool's repository with the relevant diagnostic output, redacting secrets and PII first. If you'd rather not have that, it's a single command: monomind crash-reporting disable.",
          ],
          image: {
            src: "/images/blog/gemini_1786440260_0.png",
            alt: "A test suite dashboard showing a checklist trending toward all green with zero red items remaining",
            caption: "The test suite went from 820 passing / 13 failing to 884 passing / 0 failing over the course of this review.",
          },
          keyTakeaways: [
            "28 of 39 found issues fixed and tested in 2.9.0; 11 filed as GitHub issues #62–#73",
            "Test suite: 820 passing / 13 failing → 884 passing / 0 failing",
            "Crash reporting is on by default (opt-out via monomind crash-reporting disable), with secrets/PII redaction",
          ],
        },
      ],
      conclusion: [
        "There's no headline feature in this release, and that's the point. 2.9.0 is what happens when you stop and check your own work: audit the codebase you already shipped, fix what's actually broken, and prove it with tests instead of a changelog line.",
        "Monomind is Apache-2.0 licensed and open source. If you want to see what's still open, GitHub issues #62 through #73 are the honest list of what we found but haven't fixed yet.",
      ],
    },
  },

  // --- 3 DEEP-DIVE TECHNICAL / SERVICES ARTICLES ---
  {
    slug: "deterministic-multi-agent-orchestration",
    title: "Inside Org Runtime v2: How Monomind Coordinates Real Agent Sessions",
    subtitle: "An event-bus backbone, per-role policy gates, and a human-in-the-loop that actually pauses execution — the real architecture behind Monomind's multi-agent orchestration.",
    excerpt: "Monomind's org runtime doesn't simulate a team of agents with a scripted DAG — it runs real, provider-backed AI sessions coordinated through an append-only event log and gated by per-role policy engines. Here's how OrgDaemon, OrgBus, and PolicyEngine actually work.",
    date: "August 8, 2026",
    readTime: "10 min read",
    featured: false,
    tags: ["Architecture", "Multi-Agent", "Monomind", "Org Runtime"],
    author: {
      name: "Monoes Team",
      role: "Monomind Core",
      avatar: "/images/monkey/welcoming-arms.png",
    },
    coverImage: {
      src: "/images/blog/autonomous-network-harmony.jpg",
      alt: "Multi-Agent Org Runtime Architecture Topology",
      caption: "OrgDaemon hosts multiple named orgs in a single process, each with its own set of live, provider-backed agent sessions.",
    },
    content: {
      introduction: [
        "Most descriptions of 'multi-agent orchestration' either mean a single prompt pretending to be several personas, or a rigid pipeline scheduler that treats agents as steps in a graph. Monomind's org runtime v2 is neither. Every role you define in an org config is a real, provider-backed agent session — it calls an actual model through an actual SDK, has its own tools, and can be paused, gated, or handed off to a human mid-task.",
        "The core of this system is OrgDaemon, which hosts multiple named orgs inside a single process. Underneath each org sits an append-only event log, a mailbox per role, and a policy engine per role. None of this is a DAG scheduler enforcing a pre-planned execution graph — it's an event-driven runtime where roles act, message each other, and get gated by policy in real time.",
      ],
      sections: [
        {
          id: "orgbus-and-policy-engine",
          heading: "1. OrgBus and PolicyEngine: The Real Isolation Boundary",
          subheading: "An append-only event log for coordination, and a per-role policy engine for governance",
          paragraphs: [
            "Every org runs on top of OrgBus, an append-only JSONL event log with in-process fanout. It's the backbone for everything that happens inside an org: messages between roles, dashboard sync over SSE, and the durable history a run leaves behind. Conceptually it behaves like an event-sourced log rather than a database — every event that happens during a run is appended, never mutated, and anything subscribed to the bus (the dashboard, other roles, the daemon itself) gets it as it happens.",
            "Messages between roles are delivered through a per-role Mailbox, an async queue that each role's agent session reads from between turns. This is how a coordinator role hands off work to a worker role, or how a worker reports back — org_send on one end, a mailbox delivery on the other.",
            "Governance doesn't come from sandboxed containers or schema-validated node transitions — it comes from a PolicyEngine instantiated per role. Each role's PolicyEngine enforces tool allow/deny lists, file scope restrictions, web access control, and a per-role token budget cap. Every decision the PolicyEngine makes — what it allowed, what it denied, and why — is written to an audit trail, so after a run you can see exactly which tool calls a role attempted and which ones the policy blocked.",
          ],
          image: {
            src: "/images/blog/art1-multi-agent-dag.jpg",
            alt: "OrgBus event log and per-role PolicyEngine diagram",
            caption: "OrgBus fans out append-only events to every subscriber, while each role's PolicyEngine independently gates tool use, file scope, and token budget.",
          },
          codeBlock: {
            filename: ".monomind/orgs/example.json",
            language: "json",
            code: `{
  "name": "example",
  "roles": [
    {
      "name": "coordinator",
      "runner": "claude",
      "policy": {
        "allowedTools": ["org_send", "org_task", "ask_human"],
        "deniedTools": ["bash"],
        "fileScope": ["./docs/**"],
        "webAccess": false,
        "tokenBudget": 200000
      }
    },
    {
      "name": "worker",
      "runner": "claude",
      "policy": {
        "allowedTools": ["org_send", "org_task_done", "ask_human"],
        "fileScope": ["./src/**"],
        "webAccess": false,
        "tokenBudget": 500000
      }
    }
  ]
}`,
          },
          keyTakeaways: [
            "OrgBus is an append-only JSONL event log with in-process fanout, not a database — it's the coordination and history backbone for the whole org.",
            "Each role gets its own PolicyEngine enforcing tool allow/deny lists, file scope, web access, and a token budget cap, with a full audit trail of every allow/deny decision.",
            "Every role is a real agent session, not a scripted node — six pluggable AgentRunner backends (Claude Agent SDK, opencode, Kimi Code, Vercel AI SDK, Codex CLI, Google Antigravity) implement the same interface, so the underlying model is swappable without touching org config structure.",
          ],
        },
        {
          id: "human-in-the-loop",
          heading: "2. Human-in-the-Loop: Approvals, Gates, and Questions",
          subheading: "Concrete CLI mechanisms for pausing a role until a human decides",
          paragraphs: [
            "Human oversight in the org runtime isn't a conceptual 'audit queue' — it's a set of specific, CLI-visible mechanisms that actually block execution. When a role needs a decision it can't make on its own, it has a real tool for that: ask_human. Calling it appends a question to the org's pending-questions state and fires a question event on the bus, which the dashboard picks up immediately over SSE.",
            "From there, a human runs monomind org questions <name> to see what's pending and monomind org answer <name> <question-id> \"<text>\" to deliver an answer back into the role's session — the role genuinely waits for that reply before continuing.",
            "For irreversible or high-stakes actions, roles use decision gates instead: org_gate creates a hard-blocking checkpoint, and a human resolves it with monomind org gates to list pending gates and monomind org gate-approve or monomind org gate-reject to decide. There's a separate, more general approval flow too — monomind org approve and monomind org deny act on pending approvals raised during a run. All three mechanisms (questions, gates, approvals) pause real execution; none of them are simulated.",
          ],
          image: {
            src: "/images/blog/art1-audit-queue.jpg",
            alt: "Human-in-the-loop approval flow in the org dashboard",
            caption: "A role's ask_human call surfaces as a pending question in monomind org questions — the session genuinely blocks until monomind org answer delivers a reply.",
          },
          quote: {
            text: "A gate that doesn't block execution isn't a gate — it's a suggestion. org_gate stops the role's session until a human runs org gate-approve or org gate-reject.",
            author: "Monomind Core Team",
          },
          keyTakeaways: [
            "ask_human plus monomind org questions / org answer is a real pause-and-resume mechanism for a role that needs a human decision.",
            "org_gate plus monomind org gates / org gate-approve / org gate-reject hard-blocks execution on irreversible actions until a human resolves the gate.",
            "monomind org approve / org deny handle the general approval queue — three distinct, composable mechanisms, not one invented audit threshold.",
          ],
        },
        {
          id: "cross-run-memory-and-security",
          heading: "3. Cross-Run Memory and Network Defaults",
          subheading: "Learning from past runs, and a runtime that doesn't listen on every interface by default",
          paragraphs: [
            "An org's improvement over time doesn't come from a benchmark score — it comes from org_complete and org_recall. When a boss role calls org_complete, the outcome of that run is recorded; the next time the same org runs, its roles are briefed on what happened last time. org_recall lets any role query that cross-run history directly, so an org can avoid repeating a mistake or reuse a decision it already made in a previous run. That's the project's real self-improvement loop.",
            "On the operational side, since 2.9.0 both the dashboard and the org server bind to 127.0.0.1 only, not all network interfaces — a role's session, the event bus, and the approval UI aren't exposed to the network by default. It's a small detail, but it's the kind of default that matters if you're running orgs on a shared machine.",
            "It's worth separating this from Monomind's swarm/hive-mind layer, which is a related but distinct coordination mode used for things like code review swarms. The project labels it experimental: it runs in-process only with no cross-machine networking, and 'consensus' there means a vote-count threshold, not real distributed consensus — no leader election, no log replication. Org runtime's PolicyEngine and OrgBus are the production mechanism; swarm consensus is a separate, explicitly experimental one.",
          ],
          image: {
            src: "/images/blog/art1-live-telemetry.jpg",
            alt: "Dashboard showing org run history and bound-to-localhost network status",
            caption: "org_complete records a run's outcome for org_recall to query later; since 2.9.0 the dashboard and org server bind to 127.0.0.1 only.",
          },
          keyTakeaways: [
            "org_complete records what happened in a run; org_recall lets future runs of the same org query that history — the real cross-run learning mechanism.",
            "Since 2.9.0, the dashboard and org server bind to 127.0.0.1 only, not all interfaces.",
            "Swarm/hive-mind consensus is a separate, explicitly experimental in-process vote-count mechanism — don't confuse it with the org runtime's production PolicyEngine.",
          ],
        },
      ],
      conclusion: [
        "Org runtime v2 isn't a DAG scheduler with a confidence score bolted on — it's an event-bus-backed runtime where every role is a live agent session, governed by a per-role PolicyEngine, and interruptible by a human through three concrete mechanisms: questions, gates, and approvals. Six pluggable agent runners mean the model behind any role is swappable without changing how the org is structured.",
        "Monomind is Apache-2.0 licensed and open source. Explore the org runtime source under packages/@monomind/cli/src/orgrt/, or read the full architecture doc in the repository.",
      ],
    },
  },
  {
    slug: "why-we-built-monomind-local-first-ai",
    title: "Why We Built Monomind: The Case for Local-First Open Source AI",
    subtitle: "Your data should never leave your machine just to run an AI coding agent.",
    excerpt: "Cloud AI platforms trade your data and your budget for convenience. Here's why we built Monomind as a local-first, open-source engine instead.",
    date: "August 2, 2026",
    readTime: "8 min read",
    author: {
      name: "Monoes Team",
      role: "Monomind Core",
      avatar: "/images/monkey/welcoming-arms.png",
    },
    tags: ["Open Source", "Monomind", "Privacy"],
    featured: false,
    coverImage: {
      src: "/images/blog/art2-sovereign-server.jpg",
      alt: "Local First Sovereign Server Hardware",
      caption: "Monomind runs its core memory, orchestration, and tooling locally, on hardware you control.",
    },
    content: {
      introduction: [
        "Over the past few years, developers experimenting with AI coding agents have run into the same wall: prototypes look great, but putting proprietary code, internal docs, or customer data through a third-party API stops being an easy call the moment legal, security, or a cautious engineer asks where that data actually goes.",
        "At the same time, every long-running agent loop — the kind that reads files, calls tools, and iterates — burns tokens against a metered API, and it's hard to predict what a given session will cost until the bill arrives. At Monoes, we built Monomind to take a different path: a local-first, open-source CLI and MCP server that keeps orchestration, memory, and tooling on your machine, and connects to whichever AI provider you choose to bring.",
      ],
      sections: [
        {
          id: "sovereign-vps-isolation",
          heading: "1. Data Sovereignty: Local by Default",
          subheading: "Orchestration and memory run on your machine, not ours",
          paragraphs: [
            "Monomind is a CLI plus an MCP server. Instead of routing your project through a hosted platform, it runs as a local process that plugs into whichever coding agent you're already using — Claude Code by default, and also opencode, Google Antigravity, and Kimi Code, all through the standard Model Context Protocol. There's no Monoes-hosted platform in between your code and your editor.",
            "The memory layer that gives agents context — your project's history, embeddings, and search index — is stored locally too: SQLite (via better-sqlite3, with a sql.js WebAssembly fallback if the native binary can't load) plus local MiniLM embeddings for semantic search. None of that indexing or retrieval work requires a network call.",
            "Because Monomind isn't tied to a single hosted backend, you're also not locked into one AI vendor. It's bring-your-own-key: you use whatever subscription or API access you already have for the model calls it does make, and you can swap the underlying coding agent without re-architecting your setup.",
          ],
          image: {
            src: "/images/blog/agent-network-architecture.jpg",
            alt: "Local orchestration architecture diagram",
            caption: "Figure 1: Monomind's CLI and MCP server run locally and speak MCP to your coding agent of choice.",
          },
          codeBlock: {
            filename: "memory-search-example.sh",
            language: "bash",
            code: `# Local semantic search over your project's memory store — no network call
npx monomind@latest memory search --query "authentication patterns" --namespace patterns

# Inspect what's actually being stored
npx monomind@latest memory list --namespace patterns --limit 10`,
          },
          keyTakeaways: [
            "Monomind's orchestration and memory search run as a local process — no hosted platform sits between your code and your agent.",
            "The memory backend is local SQLite plus local embeddings; a pure-JS HNSW index exists purely as a dormant fallback if native SQLite fails to load, not a primary search path.",
            "MCP support for Claude Code, opencode, Google Antigravity, and Kimi Code means no lock-in to a single AI provider.",
          ],
        },
        {
          id: "cost-predictability-and-economics",
          heading: "2. The Economics of Running Locally",
          subheading: "You already pay for your model access — Monomind doesn't add a second toll",
          paragraphs: [
            "Metered AI platforms charge for more than model inference — they often meter the orchestration layer around it too: every intermediate tool call, every retry, every piece of context an agent re-reads. That's a second bill stacked on top of whatever you're already paying your model provider.",
            "Because Monomind's orchestration, indexing, and memory retrieval run locally instead of through a hosted service, they don't add their own per-call metering on top of your model provider's bill. Your marginal cost is whatever your BYOK model access already costs — Monomind itself doesn't tax the loop.",
            "That's a meaningfully lower and more predictable marginal cost for iterative, tool-heavy agent work, even without a specific dollar figure attached to it — the honest version of the claim doesn't need a fabricated benchmark to hold up.",
          ],
          image: {
            src: "/images/blog/automated-paperwork-value.jpg",
            alt: "Local document ingestion running on a workstation",
            caption: "Figure 2: Local indexing and retrieval — no per-call metering layered on top of your existing model subscription.",
          },
          quote: {
            text: "If the orchestration layer around your agent is itself a metered SaaS product, you're paying twice for the same loop. We built Monomind so that layer runs on your own hardware instead.",
            author: "Monomind Core Team",
          },
          keyTakeaways: [
            "Monomind doesn't meter orchestration, indexing, or memory retrieval on top of your model provider's bill.",
            "It's BYOK — you bring the API key or subscription for the model calls it makes.",
            "No fabricated cost or benchmark figures here: the honest claim is 'lower marginal cost,' not a specific dollar amount.",
          ],
        },
        {
          id: "open-source-extensibility",
          heading: "3. An Extensible, Apache-2.0 Open-Source Ecosystem",
          subheading: "Inspect it, extend it, self-host it — without a restrictive license",
          paragraphs: [
            "Monomind is released under the Apache-2.0 license, which gives you the freedom to read, modify, self-host, and build on the code, along with an explicit patent grant — a meaningfully different, and for many teams more comfortable, guarantee than a closed platform's terms of service.",
            "The CLI and MCP tool surface are built to be extended: new tool integrations, custom agent roles, and workflow automation can be layered on top of the existing TypeScript codebase without waiting on a vendor roadmap.",
            "One honest caveat worth stating plainly: Monomind ships with crash reporting enabled by default. If a tool hits a hard crash, it can file a GitHub issue on that tool's own repository via the GitHub API, with secrets and PII redacted before anything is sent — it never phones a Monoes-controlled server. You can turn it off entirely with monomind crash-reporting disable. We'd rather say that clearly than claim 'zero data ever leaves your machine' and have you find out otherwise.",
          ],
          image: {
            src: "/images/blog/flow-state-telemetry.jpg",
            alt: "Open source contribution activity artwork",
            caption: "Figure 3: Built in the open under Apache-2.0 — extend it, fork it, or self-host it on your own terms.",
          },
          keyTakeaways: [
            "Monomind is Apache-2.0, not MIT — open, extensible, and with an explicit patent grant.",
            "Crash reporting is on by default and opt-out (monomind crash-reporting disable); when it fires, it files a redacted GitHub issue on the relevant tool's own repo, never a Monoes-controlled server.",
            "No hosted telemetry backend exists to opt out of in the first place — the honest privacy story is 'no vendor telemetry server,' not 'zero network calls, ever.'",
          ],
        },
      ],
      conclusion: [
        "The thesis behind Monomind hasn't changed: local-first, sovereign AI tooling that doesn't lock you into one vendor or meter your orchestration loop on top of your model bill. What's changed in this piece is a commitment to only make claims we can actually stand behind — accurate licensing, an honest description of the memory architecture, and a clear-eyed account of the one outbound call the tool does make by default.",
        "Explore the open-source Monomind engine on GitHub, or read the docs to see how it plugs into Claude Code, opencode, Google Antigravity, or Kimi Code.",
      ],
    },
  },
  {
    slug: "zero-rip-and-replace-erp-automation",
    title: "Zero Rip-and-Replace: A Non-Invasive Approach to Automating Legacy-System Processes",
    subtitle: "What a Monoes Workforce engagement looks like when the process to automate — like accounts payable or vendor reconciliation — lives inside a legacy ERP or CRM.",
    excerpt: "Replacing a legacy ERP takes years and carries real operational risk. Here's how a Workforce engagement is designed to automate the process instead — operating over existing UIs and APIs, with human approval built in from day one.",
    date: "July 24, 2026",
    readTime: "8 min read",
    featured: false,
    tags: ["Workforce", "Services", "Enterprise"],
    author: {
      name: "Monoes Team",
      role: "Monoes Workforce",
      avatar: "/images/monkey/welcoming-arms.png",
    },
    coverImage: {
      src: "/images/blog/gemini_1786440191_0.png",
      alt: "Workspace representing a legacy back-office process",
      caption: "Legacy back-office processes — like accounts payable — are often the highest-ROI candidates for a Workforce engagement, precisely because they're the most manual.",
    },
    content: {
      introduction: [
        "For most enterprise organizations, the software that runs the business — an ERP, a CRM, an accounting suite — isn't going anywhere. It's deeply customized, it's load-bearing, and replacing it is a multi-year, multi-million-dollar undertaking that few teams are willing to greenlight just to fix one slow process.",
        "But the processes that run on top of that software are often still manual: someone re-keying invoice data, cross-checking a purchase order in one tab against a PDF in another, chasing an approval over email. That gap — between a system nobody wants to touch and a process everybody wishes were faster — is what a Monoes Workforce engagement is built to close. This post walks through how we'd approach that kind of engagement, and the design philosophy behind it. We don't have a completed case study to point to yet — we're intentionally building our first ones in the open, with founding clients, rather than claiming results we haven't earned.",
      ],
      sections: [
        {
          id: "non-invasive-by-design",
          heading: "1. Non-Invasive by Design: Working Over Interfaces, Not Inside Databases",
          subheading: "Why we build connectors that operate the way a person does, rather than rewriting backend logic",
          paragraphs: [
            "Modifying a legacy system's backend — custom scripts, direct database writes, undocumented internal APIs — is exactly the kind of work that voids support contracts and introduces compliance risk. It's also usually unnecessary for the problem at hand.",
            "The architecture we configure per engagement is deliberately layered: a Workflow (a deterministic controller for the overall process), Agents (reasoning bounded to a specific step, like reading an invoice), Policies (versioned, auditable rules set by the client — for example, what dollar threshold requires human sign-off), and Connectors (the swappable bridge into a client's actual systems — their ERP, their CRM, their inbox). Connectors are built to operate the same surfaces a person already uses: existing UI sessions, existing REST endpoints, existing exports. No backend rewrite, no new database schema.",
            "That non-invasive posture is also what makes a Discovery engagement possible before anything is built: we can map an existing process end-to-end — where the data lives, where the approvals happen, where the manual work actually is — without touching production systems at all.",
          ],
          image: {
            src: "/images/blog/gemini_1786440080_0.png",
            alt: "Document review workspace",
            caption: "The kind of process a Discovery engagement maps: documents moving between systems, with manual checks at each handoff.",
          },
          codeBlock: {
            filename: "process-definition-illustrative.json",
            language: "json",
            code: `// Illustrative shape only — the kind of process definition
// a Discovery engagement report might capture, not a shipped
// product feature or a real integration with any named vendor.
{
  "process": "vendor_invoice_intake",
  "workflow": "deterministic_controller",
  "steps": [
    { "agent": "read_invoice", "bounded_to": "single_document" },
    { "agent": "match_purchase_order", "bounded_to": "single_document" }
  ],
  "policy": {
    "version": 1,
    "require_human_approval_above": "<client-defined threshold>"
  },
  "connector": {
    "category": "ERP",
    "mode": "existing_ui_or_api_session"
  }
}`,
          },
          keyTakeaways: [
            "No modification of a client's underlying ERP, CRM, or database schema.",
            "Connectors are built per engagement to operate over a client's existing UI and API surfaces.",
            "Discovery engagements map a process without touching production systems.",
          ],
        },
        {
          id: "trust-earned-in-stages",
          heading: "2. Human Approval First, Autonomy Earned Over Time",
          subheading: "Why engagements typically start at Level 2 — AI executes, a human approves — not full autonomy",
          paragraphs: [
            "We think about engagement maturity across five levels: Manual, AI Copilot, AI Executes with Human Approval, Autonomous Execution, and Autonomous Exception Handling. A new engagement typically starts at Level 2 — the system does the work, but a person reviews and approves before anything final happens. Autonomy is earned upward from there, as the policy proves itself against real cases.",
            "Policies are set per client, not assumed. 'An invoice over a given dollar amount needs a human sign-off' is a real, common policy — but the threshold, the escalation path, and who the approver is are all decisions the client makes, versioned and auditable, not a default baked into the product.",
            "Practically, this means the first weeks of a Pilot look less like 'the process is automated' and more like 'the process is drafted by the system and checked by a person' — with the review burden shrinking as the policy earns trust, not disappearing on day one.",
          ],
          image: {
            src: "/images/blog/human-ai-partnership.jpg",
            alt: "Human reviewing work alongside an automated process",
            caption: "Engagements start with a human in the approval loop — autonomy is earned as the policy proves itself, not assumed from the outset.",
          },
          keyTakeaways: [
            "Engagements start at Level 2: AI executes, a human approves.",
            "Approval thresholds and escalation rules are set per client, not a universal default.",
            "Autonomy expands only as the configured policy demonstrates it's earned that trust.",
          ],
        },
        {
          id: "how-an-engagement-is-scoped",
          heading: "3. How an Engagement Is Actually Scoped and Priced",
          subheading: "Discovery, Pilot, and Expand — a fixed, itemized path rather than open-ended billing",
          paragraphs: [
            "An engagement starts with Discovery: a 1-Day Discovery ($3,000) maps a single process end-to-end and identifies the highest-ROI automation opportunity within it, or a 5-Day Discovery ($12,000) maps multiple processes across departments and produces a ranked opportunity backlog.",
            "From there, a Pilot is scoped from the Discovery findings — typically starting around $15,000 and scaling with the number of processes and systems involved — and it's always a fixed, itemized quote drawn directly from the Discovery report, never open-ended time-and-materials billing. A successful Pilot moves into Expand & Build Trust (roughly one to three months, extending the automation and raising the human-in-the-loop level as warranted), and eventually Scale, as an ongoing engagement.",
            "We're currently running this as a founding client program: three slots, 20% off implementation, and direct access to the person building it — no account-manager layer — in exchange for being a named reference once the first worker is live. We're upfront that we don't have a completed case study yet, because we haven't built one; the founding client program is how the first ones get built, honestly.",
          ],
          image: {
            src: "/images/blog/gemini_1786440132_0.png",
            alt: "Workspace where a process is reviewed and refined",
            caption: "A Pilot is scoped from the Discovery report into a fixed, itemized quote — not open-ended billing.",
          },
          keyTakeaways: [
            "Discovery: 1-Day ($3,000) maps one process; 5-Day ($12,000) maps a ranked backlog across departments.",
            "Pilots start around $15,000 as a fixed, itemized quote from the Discovery report — never open-ended.",
            "The founding client program trades a discount and direct access for being a named reference once a worker is live.",
          ],
        },
      ],
      conclusion: [
        "A legacy system doesn't have to be replaced for the process running on top of it to get faster. The point of a non-invasive, human-approved-first engagement is that it can start small, prove itself against real cases, and expand only as far as the client wants to take it.",
        "If a manual process in your ERP, CRM, or back office sounds like a fit, a 1-Day or 5-Day Discovery is the place to start — it maps the process and the opportunity before anything is built.",
      ],
    },
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}
