import type { Guide } from "./types";

const UPDATED = "2026-10-13";

const MONO_AGENT_RELATED = [
  { label: "Mono Agent", href: "/projects/mono-agent" },
  { label: "Mono Agent vs n8n", href: "/compare/mono-agent-vs-n8n" },
  { label: "All guides", href: "/guides" },
];

export const monoAgentGuides: Guide[] = [
  {
    slug: "n8n-without-docker",
    title: "n8n 3.0 requires Docker: what changes, and how to run automation without it",
    description:
      "n8n 3.0 ends npm installs and makes Docker the only self-hosted option. Who that hurts, the three ways forward, and an honest look at Mono Agent as a single-binary alternative.",
    summary:
      "From n8n 3.0 (scheduled for October 2026) self-hosted n8n runs only in Docker: npm and npx installs end, and the Function, Function Item and Item Lists nodes are removed. If Docker is a problem on your machine, you can run n8n with Docker Compose anyway, move to n8n Cloud, or switch to a tool that needs no container. Mono Agent is one: a single Go binary with embedded SQLite for macOS, Linux (amd64 and arm64) and Windows. It needs a monoes.me sign-in and has far fewer integrations than n8n.",
    updated: UPDATED,
    table: {
      columns: ["", "n8n 3.0 self-hosted", "Mono Agent"],
      rows: [
        ["Runtime", "Node.js inside the official Docker image", "One static Go binary; AI steps also use the monomind runner (Node.js)"],
        ["Required services", "A Docker engine (Docker Desktop or WSL2 on Windows); optionally Postgres", "None; SQLite is built in"],
        ["Install command", "docker volume create n8n_data, then docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n", "curl -fsSL https://raw.githubusercontent.com/monoes/mono-agent/HEAD/install.sh | bash, then monoagentcli account login"],
        ["Licence", "Sustainable Use License (fair-code)", "Monoes Proprietary Software License; free of charge for now, source not public"],
        ["Account", "Self-hosting runs without an n8n account", "A monoes.me sign-in is required; a signed token allows up to 24 hours offline"],
        ["Integrations", "1,500+", "167 node types in the default build"],
      ],
    },
    sections: [
      {
        heading: "What n8n 3.0 changes",
        paragraphs: [
          "n8n's 3.0 breaking-changes page lists Docker as the only supported way to self-host. Installing with npm or running with npx is no longer supported, and the legacy Function, Function Item and Item Lists nodes are removed, so workflows using them need to be rewritten before upgrading. Source: https://docs.n8n.io/changelog/v30-breaking-changes (read 2026-10-13).",
          "n8n Cloud is unaffected. The change only matters if you run n8n yourself.",
        ],
      },
      {
        heading: "Who it hurts",
        paragraphs: [
          "The n8n community thread on the proposal collected the cases where Docker is a real cost rather than a formality: https://community.n8n.io/t/your-view-on-a-proposed-change-requiring-docker-to-run-n8n/298916.",
        ],
        bullets: [
          "Low-RAM Windows machines, where Docker Desktop and its WSL2 VM take memory the workflows needed.",
          "NAS boxes such as Synology and Unraid, where container user IDs and volume permissions are a recurring source of breakage.",
          "Small VPS plans, where a container engine adds memory and disk overhead to a single small service.",
          "Locked-down corporate machines, where installing Docker or enabling virtualization needs an exception from IT.",
        ],
      },
      {
        heading: "Your three options",
        bullets: [
          "Stay on n8n with Docker Compose. If Docker already runs on the machine, this is the least work: one compose file, a named volume for /home/node/.n8n, and you keep every workflow and integration.",
          "Move to n8n Cloud. No server to run at all, priced by executions (Starter €24 for 2,500, Pro €60 for 10,000 per month, per https://toolradar.com/blog/n8n-pricing-2026).",
          "Switch to a single-binary tool such as Mono Agent, if your workflows fit its smaller set of integrations and you want nothing between the binary and the operating system.",
        ],
      },
      {
        heading: "Install Mono Agent in about 60 seconds",
        bullets: [
          "Run: curl -fsSL https://raw.githubusercontent.com/monoes/mono-agent/HEAD/install.sh | bash (macOS arm64/amd64, Linux amd64/arm64; the script checks the SHA256 of the download). On Windows, download the .exe from https://github.com/monoes/mono-agent/releases.",
          "Sign in: monoagentcli account login. It opens your browser; on a machine without one, monoagentcli account login --email you@example.com mails you a code.",
          "Check the setup: monoagentcli doctor.",
          "Keep schedules and webhooks running: monoagentcli daemon install registers the engine to start at login.",
        ],
      },
      {
        heading: "Raspberry Pi and NAS",
        paragraphs: [
          "The Linux arm64 build runs on a 64-bit Raspberry Pi OS, and the amd64 build on most x86 NAS boxes. On Synology or Unraid you copy the binary onto the box and run it; there is no container, image or volume mapping to get right.",
          "monoagentcli daemon install writes a systemd user unit for you. To write it by hand, create ~/.config/systemd/user/monoagent-daemon.service with these lines:",
        ],
        bullets: [
          "[Unit]",
          "Description=MonoAgent daemon",
          "After=default.target",
          "[Service]",
          "ExecStart=/usr/local/bin/monoagentcli daemon (the installer's default path; use the one it printed)",
          "Restart=on-failure",
          "RestartSec=5",
          "[Install]",
          "WantedBy=default.target",
          "Then run systemctl --user daemon-reload and systemctl --user enable --now monoagent-daemon. Run loginctl enable-linger $USER once so the unit keeps running when you are logged out.",
        ],
      },
      {
        heading: "How much lighter? A benchmark on a 1 GB limit",
        paragraphs: [
          "We ran both tools with their default settings, one at a time, each in a container limited to 1 GB of memory and 1 CPU (docker run --memory 1g --memory-swap 1g --cpus 1). Mono Agent was v0.135.0 running monoagentcli daemon. n8n was the official image docker.n8n.io/n8nio/n8n:2.43.4 with its default SQLite database. Each tool ran the same workflow: a webhook trigger, then a step that sets one field. We sent 1,000 webhook requests from 10 parallel callers and stopped the clock when the 1,000th run was saved in the tool's own database. The table below gives the median of 3 rounds, measured on 2026-10-13.",
        ],
        bullets: [
          "Idle memory, 60 s after start: Mono Agent 49 MiB, n8n 448 MiB.",
          "Cold start, from process start to the first accepted webhook: Mono Agent 0.22 s, n8n 9.6 s.",
          "Time to complete 1,000 runs: Mono Agent 5.8 s (171 runs/s), n8n 129 s (7.7 runs/s).",
          "Peak memory under that load: Mono Agent 204 MiB, n8n 787 MiB.",
          "Install size: Mono Agent is an 88.6 MB binary; the n8n image is 1.69 GB.",
          "Caveats: the test machine was busy with other work, so absolute numbers are noisy, and neither tool was tuned. Mono Agent runs at most 3 workflows at once by default, while n8n's default mode has no cap. n8n 3.0 was not yet released, so we tested its current stable version. Re-run it yourself on an idle machine before you rely on the figures.",
        ],
      },
      {
        heading: "When to stay on n8n",
        bullets: [
          "Integration breadth: n8n has 1,500+ integrations and many app-event triggers. Mono Agent has 167 node types; check that yours are covered before moving.",
          "Source and account: n8n's fair-code source is public and self-hosting works without an n8n account. Mono Agent's source is not public and it needs a monoes.me sign-in.",
          "Community and templates: n8n has a large forum and thousands of community templates.",
          "Teams: n8n offers users, roles and SSO. Mono Agent is a single-user tool today.",
          "If Docker already runs where you host n8n, 3.0 changes little for you. Upgrade and stay.",
        ],
      },
      {
        heading: "Moving workflows across",
        paragraphs: [
          "An importer for n8n workflow JSON is being built and is not released yet. Until it ships, workflows are rebuilt by hand in the desktop canvas or as JSON through the CLI, which is realistic for a handful of workflows and slow for dozens.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I still install n8n with npm after 3.0?",
        answer:
          "No. n8n 3.0 removes npm and npx as supported self-hosting methods; Docker is the supported way (https://docs.n8n.io/changelog/v30-breaking-changes). An installed older version keeps running; check n8n's own release notes for how long it receives fixes.",
      },
      {
        question: "Does Mono Agent need Docker?",
        answer:
          "No. The engine is one static Go binary with SQLite built in. A Docker image exists if you prefer containers, but it is optional. AI steps additionally use the monomind runner, which runs on Node.js.",
      },
      {
        question: "Do I need an account to use Mono Agent?",
        answer:
          "Yes. A monoes.me sign-in has been required since 2026-10-11 and nothing runs before you sign in. A signed token allows up to 24 hours offline. Mono Agent sends no analytics, usage counters or device identifier; it contacts monoes.me to sign in and to check for updates.",
      },
      {
        question: "Is Mono Agent open source?",
        answer:
          "No. Current versions are under the Monoes Proprietary Software License: free of charge for now, for personal or internal business use, and the source is not public. Versions up to v0.133.0 were MIT licensed.",
      },
      {
        question: "Can I import my n8n workflows?",
        answer:
          "Not yet. An n8n workflow importer is being built. Today you rebuild workflows in the canvas or the CLI.",
      },
    ],
    related: [
      { label: "Leaving OpenAI Agent Builder", href: "/guides/leaving-openai-agent-builder" },
      { label: "No AI credits: automation on your own subscription", href: "/guides/no-ai-credits-automation" },
      ...MONO_AGENT_RELATED,
    ],
  },
  {
    slug: "leaving-openai-agent-builder",
    title: "OpenAI Agent Builder is shutting down: timeline and migration options",
    description:
      "Agent Builder shuts down on 2026-11-30. The dates, OpenAI's recommended path, and how Agent Builder concepts map onto Mono Agent workflows, including what has no equivalent.",
    summary:
      "OpenAI announced Agent Builder's deprecation on 2026-06-03. Evals become read-only on 2026-10-31, and Agent Builder, Evals and reusable prompts shut down on 2026-11-30. OpenAI's own path is the Agents SDK (code) or ChatGPT Workspace Agents (no code). If you want a visual workflow that runs on your machine instead, Mono Agent covers agent steps, approvals, branching, MCP and multi-agent runs, but has no hosted chat widget, no file search and no evals.",
    updated: UPDATED,
    table: {
      columns: ["Agent Builder", "Mono Agent", "Notes"],
      rows: [
        ["Agent node", "agent.ask", "Runs on an agent CLI you already have (Claude Code, Codex, OpenCode, Copilot and others) with that CLI's own login"],
        ["Guardrails / user approval", "core.human_in_loop", "Durable queue; the reviewer can edit fields before approving; a timeout auto-rejects"],
        ["If/else", "core.if, core.switch", "Expression-based branching"],
        ["MCP tools", "Mono Agent MCP server; the agent runtime's own MCP servers", "monoagentcli mcp exposes workflows to agents; agent.ask runtimes keep their configured MCP servers"],
        ["Multi-agent", "org.run, org.ask", "Hand a task to an organization of agents"],
        ["State / variables", "core.set plus expressions", "Values pass between steps as data"],
        ["File search", "No direct equivalent", "There is no built-in vector store over uploaded files"],
        ["ChatKit (hosted chat widget)", "No equivalent", "Workflows start from a webhook, schedule, the CLI or the desktop app"],
        ["Evals", "Not provided", "Use the run history to review outputs; there is no grading tool"],
      ],
    },
    sections: [
      {
        heading: "The shutdown timeline",
        bullets: [
          "2026-06-03: deprecation announced.",
          "2026-10-31: Evals become read-only.",
          "2026-11-30: Agent Builder, Evals and reusable prompts shut down.",
          "Source: https://developers.openai.com/api/docs/deprecations/index.html (read 2026-10-13).",
        ],
      },
      {
        heading: "OpenAI's own migration path",
        paragraphs: [
          "OpenAI points Agent Builder users to two places. The Agents SDK is the code route: you keep OpenAI models and get full control over tools, handoffs and tracing, in exchange for writing and hosting the code. ChatGPT Workspace Agents are the no-code route inside ChatGPT. If your agent is a chat experience for people already in ChatGPT, or you want to stay on OpenAI's platform, one of these is likely the simplest move.",
        ],
      },
      {
        heading: "When Mono Agent is a better fit",
        bullets: [
          "Your agent is really a workflow: a trigger, a few AI steps, an approval, an action.",
          "You want it to run on your own machine, with run history stored locally in SQLite.",
          "You want a person to approve or edit the output before anything is sent, with a queue that survives restarts.",
          "You would rather pay for AI through an agent CLI subscription you already have than through per-token API billing.",
        ],
      },
      {
        heading: "A starter workflow",
        paragraphs: [
          "Mono Agent ships a template at examples/agent-builder-migration.json. It is a starter, not a converter: a webhook trigger receives a request, agent.ask classifies it and drafts a reply, core.human_in_loop holds the draft for a person to edit and approve, and the approved reply is sent on. Replace the prompts with your Agent Builder instructions and add branches with core.if or core.switch where your agent had them.",
          "There is no automatic import of Agent Builder exports. You rebuild each agent by hand, which takes minutes for a simple one and longer for agents with many branches.",
        ],
      },
      {
        heading: "What you lose",
        bullets: [
          "Hosted chat UI: there is no ChatKit-style widget to embed on a website.",
          "File search: no managed vector store; you would call your own search service over HTTP.",
          "Evals: no datasets or graders.",
          "Hosting: Mono Agent runs on your machine, so that machine has to be on for schedules and webhooks to fire.",
          "Account: Mono Agent needs a monoes.me sign-in.",
        ],
      },
    ],
    faqs: [
      {
        question: "When does Agent Builder stop working?",
        answer:
          "On 2026-11-30, together with Evals and reusable prompts. Evals become read-only earlier, on 2026-10-31 (https://developers.openai.com/api/docs/deprecations/index.html).",
      },
      {
        question: "What does OpenAI recommend instead?",
        answer:
          "The Agents SDK for code-based agents, or ChatGPT Workspace Agents for no-code agents inside ChatGPT.",
      },
      {
        question: "Can Mono Agent import my Agent Builder workflows?",
        answer:
          "No. Start from the examples/agent-builder-migration.json template and rebuild each agent; the concept table above shows which node replaces which.",
      },
      {
        question: "Can I keep using OpenAI models in Mono Agent?",
        answer:
          "Yes, through an agent CLI that uses them, such as Codex, signed in with your own ChatGPT plan. agent.ask runs on whichever supported agent CLI you choose.",
      },
      {
        question: "Is there a replacement for Agent Builder's evals?",
        answer: "Not in Mono Agent. It keeps a run history you can review, but it has no evaluation datasets or graders.",
      },
    ],
    related: [
      { label: "No AI credits: automation on your own subscription", href: "/guides/no-ai-credits-automation" },
      { label: "Claude Code Routines and Mono Agent", href: "/guides/claude-code-routines-and-mono-agent" },
      ...MONO_AGENT_RELATED,
    ],
  },
  {
    slug: "no-ai-credits-automation",
    title: "No credits: your AI subscription, your machine",
    description:
      "What an AI step costs per month on Zapier, Make, Gumloop, n8n and Mono Agent at 10,000 runs, using only published prices, and the trade-offs of running AI on a subscription you already pay for.",
    summary:
      "Most hosted automation tools meter AI: Zapier draws AI steps from your task pool, Make and Gumloop charge credits that vary by AI module, and n8n bills executions plus your model provider's API usage. Mono Agent has no AI meter. Its AI steps run on an agent CLI you already pay for, such as a flat Claude or ChatGPT plan, and the software is free of charge for now. You still run the machine, and your subscription's own usage limits apply.",
    updated: UPDATED,
    table: {
      columns: ["Tool", "Published entry price", "10,000 runs/month, one AI step each"],
      rows: [
        ["Zapier", "Free: 100 tasks. Professional from $19.99/month (annual) for 750 tasks; Team $69", "Needs at least 10,000 tasks, far above the 750-task entry tier; price depends on plan / AI step multiplier"],
        ["Make", "From $9/month; credits since 2025-08-27", "AI modules use a variable number of credits; depends on plan / AI step multiplier"],
        ["Gumloop", "Pro $37/month for 20,000 credits (1 credit = $0.005), 8% orchestration fee, no free plan", "Credits per AI step vary by model; depends on plan / AI step multiplier"],
        ["n8n Cloud", "Starter €24/month for 2,500 executions; Pro €60/month for 10,000", "Pro covers 10,000 executions, plus your model provider's API bill for the AI step"],
        ["n8n self-hosted", "Free Community Edition; you pay for the server", "Server cost plus your model provider's API bill for the AI step"],
        ["Mono Agent", "Free of charge for now", "No per-run or per-step fee; AI runs on the agent CLI subscription you already have, within its usage limits"],
      ],
    },
    sections: [
      {
        heading: "Where the prices come from",
        bullets: [
          "Zapier plans and AI steps drawing from the task pool: https://eesel.ai/blog/zapier-subscription",
          "Make credits and variable AI module costs: https://www.make.com/en/credits",
          "Gumloop Pro, credit value and orchestration fee: https://www.eesel.ai/blog/gumloop-pricing",
          "n8n Cloud plans: https://toolradar.com/blog/n8n-pricing-2026",
          "All read on 2026-10-13. Competitor prices change often; check the vendor's page before deciding.",
        ],
      },
      {
        heading: "Why we did not fill in every cell",
        paragraphs: [
          "What one AI step costs on Zapier, Make and Gumloop depends on the plan tier you land in and on how many tasks or credits that AI step consumes, which varies by model and module. The published pages do not give one number for that, so the table says so instead of guessing.",
        ],
      },
      {
        heading: "How Mono Agent runs AI without credits",
        paragraphs: [
          "AI steps such as agent.ask hand the prompt to an agent CLI on your machine (Claude Code, Codex, OpenCode, Copilot and others) through the monomind runner. The CLI uses its own login and plan. Mono Agent stores no AI keys for text AI and sells no AI credits, so there is no per-step meter between you and the model.",
          "The software is free of charge for now. Its licence says Monoes may charge for future versions or features, announced in advance and never retroactively for a version you already have.",
        ],
      },
      {
        heading: "The trade-offs",
        bullets: [
          "You run the machine. Schedules and webhooks fire only while the daemon is running, so a laptop that sleeps misses runs.",
          "Subscription limits still apply. Flat Claude and ChatGPT plans have usage limits; a burst of thousands of AI steps can hit them, and runs then wait or fail until the limit resets.",
          "Not a hosted SaaS. There is no shared cloud workspace, no team billing and no uptime guarantee from anyone but you.",
          "A monoes.me sign-in is required to use Mono Agent.",
          "Hosted tools win when nobody on your side wants to keep a machine running, or when a team needs shared access.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Mono Agent free?",
        answer:
          "Free of charge for now. The licence allows Monoes to charge for future versions or features after announcing it, never retroactively.",
      },
      {
        question: "Do I need an OpenAI or Anthropic API key?",
        answer:
          "Not for text AI steps. They run through an agent CLI signed in with your own plan. Some other nodes, such as image generation, use their own provider keys stored in the encrypted vault.",
      },
      {
        question: "What happens when I hit my subscription's usage limit?",
        answer:
          "The agent CLI refuses further requests until the limit resets, and the AI steps that need it fail or wait. Size schedules to what your plan allows.",
      },
      {
        question: "Why is there no single price for Zapier or Make in the table?",
        answer:
          "Because the cost of an AI step depends on the plan tier and on how many tasks or credits the step uses, which their published pages do not fix to one number.",
      },
    ],
    related: [
      { label: "Mono Agent vs Zapier", href: "/compare/mono-agent-vs-zapier" },
      { label: "Mono Agent vs Make", href: "/compare/mono-agent-vs-make" },
      { label: "n8n 3.0 requires Docker", href: "/guides/n8n-without-docker" },
      ...MONO_AGENT_RELATED,
    ],
  },
  {
    slug: "claude-code-routines-and-mono-agent",
    title: "Claude Code Routines and Mono Agent: how they fit together",
    description:
      "Claude Code Routines and Claude in Chrome run AI on a schedule. Mono Agent adds deterministic steps, webhooks, sub-hour schedules and durable approvals. When to use each, and how to connect them over MCP.",
    summary:
      "Claude Code Routines run Claude Code sessions in Anthropic's cloud on a cron schedule (at most hourly), an API call or a GitHub event, and Claude in Chrome adds scheduled shortcuts and recorded browser workflows. Every run is driven by the model. Mono Agent complements them: deterministic steps, schedules finer than an hour, webhooks, durable human approval, local run history and recorded browser steps that replay without a model call, with AI only where it adds value via agent.ask on Claude Code itself.",
    updated: UPDATED,
    table: {
      columns: ["", "Claude Code Routines", "Claude in Chrome", "Mono Agent"],
      rows: [
        ["Where it runs", "Anthropic cloud", "Your browser", "Your machine"],
        ["Triggers", "Cron (minimum 1 hour), API call, GitHub events", "Scheduled shortcuts", "Manual, cron schedule (down to seconds), webhook, agent org"],
        ["Each step", "Model-driven", "Model-driven", "Deterministic, with agent.ask where you want AI"],
        ["Human approval", "Not a built-in queue", "Not a built-in queue", "core.human_in_loop: durable queue, edit before approve, timeout"],
        ["Run history", "In Claude Code", "In the browser", "Local SQLite"],
        ["Status", "Research preview since 2026-04-14", "Generally available for paid plans since 2026-08-26", "Released; monoes.me sign-in required"],
      ],
    },
    sections: [
      {
        heading: "What Routines and Claude in Chrome do well",
        paragraphs: [
          "A Routine is a saved Claude Code task that runs on Anthropic's infrastructure on a schedule, from an API call or on a GitHub event, so nothing on your side needs to stay on (overview: https://www.dsebastien.net/claude-code-routines/). Claude in Chrome brings scheduled shortcuts and workflow recording to the browser you use every day. Both treat the model as the engine: every run is an agent session that reads the situation and decides what to do.",
        ],
      },
      {
        heading: "What Mono Agent adds",
        bullets: [
          "Deterministic steps: HTTP calls, data transforms, branching and database writes run the same way every time and cost no model tokens.",
          "Schedules finer than an hour: the scheduler accepts cron expressions with seconds.",
          "Webhooks: any service that can send an HTTP request can start a workflow.",
          "Durable human approval: core.human_in_loop holds a run until a person approves, edits or rejects it, and the queue survives restarts.",
          "Local run history: every run and its per-step output is stored in SQLite on your machine.",
          "Recorded browser steps: the recorder turns your clicks in your own logged-in Chrome or Edge into an automation that replays without a model call per run; browser.jev adds an adaptive step only where a page changes.",
          "AI where it adds value: agent.ask runs a prompt through Claude Code itself, on your existing plan, for the steps that need judgment.",
        ],
      },
      {
        heading: "How to connect them",
        paragraphs: [
          "Register Mono Agent's MCP server with Claude Code: claude mcp add monoagent -- monoagentcli mcp --allow-mutations. Claude Code can then list workflows, run them and approve or reject items waiting in the human-approval queue. Without --allow-mutations the server is read-only: Claude Code can list and inspect, but not run or approve. monoagentcli setup can also register the server for you; check with claude mcp list which flags it was registered with.",
          "This works for Claude Code running on the same machine as Mono Agent. A Routine running in Anthropic's cloud cannot reach a local stdio MCP server; to start a Mono Agent workflow from a cloud Routine, have it call a webhook you expose. In the other direction, a Mono Agent workflow can start a Routine through its API trigger with an HTTP step.",
        ],
      },
      {
        heading: "When Routines alone is simpler",
        bullets: [
          "The task is mostly judgment: triaging issues, reviewing a pull request, summarizing a repo. A Routine does that with a prompt and no workflow to build.",
          "Hourly or daily is often enough and you do not want a machine of your own running.",
          "The trigger is a GitHub event; Routines handle that natively.",
          "Nothing needs a human sign-off before it happens.",
          "You do not want another account: Mono Agent needs a monoes.me sign-in.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does Mono Agent replace Claude Code Routines?",
        answer:
          "No. Routines are good at model-driven tasks in the cloud. Mono Agent handles the deterministic parts, approvals and frequent schedules, and can call Claude Code through agent.ask where a step needs AI.",
      },
      {
        question: "Can a Routine run a Mono Agent workflow?",
        answer:
          "Through a webhook you expose, yes. The MCP route (monoagentcli mcp) works only for Claude Code running on the same machine as Mono Agent, because Routines run in Anthropic's cloud.",
      },
      {
        question: "Does agent.ask use my Claude subscription?",
        answer:
          "It runs Claude Code with Claude Code's own login, so it uses whatever plan that login has, including its usage limits. Mono Agent adds no AI charge.",
      },
      {
        question: "How often can a Mono Agent workflow run?",
        answer:
          "Cron schedules accept seconds, so well under an hour, as long as the daemon is running. Routines' minimum is one hour.",
      },
    ],
    related: [
      { label: "No AI credits: automation on your own subscription", href: "/guides/no-ai-credits-automation" },
      { label: "Leaving OpenAI Agent Builder", href: "/guides/leaving-openai-agent-builder" },
      { label: "Monomind vs Claude Code subagents", href: "/compare/monomind-vs-claude-code-subagents" },
      ...MONO_AGENT_RELATED,
    ],
  },
];
