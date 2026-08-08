"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

interface StepDetail {
  sections: {
    label: string;
    content: React.ReactNode;
  }[];
}

interface Step {
  num: string;
  title: string;
  body: string;
  tag: string;
  isSetup?: boolean;
}

const STEP_DETAILS: StepDetail[] = [
  // Step 00
  {
    sections: [
      {
        label: "Initiate an AI orchestration layer",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-espresso/65 leading-relaxed">
              Deploy an AI orchestration layer as a shared, project-wide system — not a per-developer local tool. Any layer that provides persistent memory, codebase-aware retrieval, MCP integrations, and lifecycle hooks can enable this model.
            </p>
            <p className="text-sm text-espresso/65 leading-relaxed">
              The key requirement: it must be initialized once at the project level, shared across all sessions, and capable of accumulating context over time. A local install that resets each session does not qualify.
            </p>
            <div className="bg-ivory-parchment border border-ivory-linen rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-label text-gold-dark font-semibold mb-3">What to look for</p>
              <ul className="space-y-2">
                {[
                  "Persistent memory that survives across sessions",
                  "Codebase knowledge graph (indexes your repo, not just reads files)",
                  "MCP server for project management tool integration",
                  "Lifecycle hooks that fire on session start, task completion, and file edits",
                  "Background workers for security audit, pattern detection, and learning",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-xs text-espresso/60 leading-relaxed">
                    <span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-gold-dark/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ),
      },
      {
        label: "2. Write the Foundation layer: .constraints.yaml",
        content: (
          <div className="space-y-3">
            <p className="text-sm text-espresso/65 leading-relaxed">
              This file is committed to your repo root. It governs every AI-generated change, forever. You write it once and update it as the project evolves.
            </p>
            <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`# .constraints.yaml
dependencies:
  banned:
    - moment        # use date-fns
    - lodash        # use native methods
  require_approval_for_new: true

files:
  max_lines: 500
  no_write_to:
    - src/styles/globals.css
    - prisma/migrations/

security:
  no_hardcoded_secrets: true
  require_input_validation: true
  ban_eval: true

api:
  require_auth_on:
    - /api/admin/*
    - /api/payments/*`}</pre>
            <p className="text-xs text-espresso/50 leading-relaxed">
              This is machine-read by CI linters and injected into every agent context. The AI cannot violate it even if a spec asks it to.
            </p>
          </div>
        ),
      },
      {
        label: "3. Set up the Contracts layer: test structure",
        content: (
          <div className="space-y-3">
            <p className="text-sm text-espresso/65 leading-relaxed">
              Create a <code className="font-mono bg-ivory-parchment px-1 rounded">tests/contracts/</code> directory. Each file defines what success looks like for a domain. You write the expectations; the AI writes the implementation.
            </p>
            <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`tests/
  contracts/
    auth.contract.test.ts      # what auth must do
    payments.contract.test.ts  # what payments must do
    webhooks.contract.test.ts  # what webhooks must do
  integration/                 # AI writes these per-task
  unit/                        # AI writes these per-task`}</pre>
          </div>
        ),
      },
      {
        label: "4. Connect your project management tool via MCP",
        content: (
          <div className="space-y-3">
            <p className="text-sm text-espresso/65 leading-relaxed">
              Connect whichever tool your team uses for tickets. The AI will pull specs directly from here — no copy-pasting from ticket to prompt.
            </p>
            <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`# Linear
claude mcp add linear -- npx @linear/mcp-server

# GitHub Issues
# Reads automatically from the current repo via GitHub MCP

# Jira
claude mcp add jira -- npx @atlassian/mcp-server

# Notion
claude mcp add notion -- npx @notionhq/mcp-server`}</pre>
          </div>
        ),
      },
      {
        label: "5. Write the project identity file",
        content: (
          <div className="space-y-3">
            <p className="text-sm text-espresso/65 leading-relaxed">
              This file is injected into every session as the AI&apos;s permanent self-knowledge about your project. Write it once; update it when the project changes significantly.
            </p>
            <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`# .ai-context/identity.md

## Project
Name: Orders API
Stack: Node 20, TypeScript, Prisma, PostgreSQL, BullMQ

## Architecture decisions
- BullMQ for all async queues (not raw Redis)
- Zod for all runtime validation (not Joi, not Yup)
- date-fns for date math (not moment)

## Security posture
- SOC 2 Type II in progress — no PII in logs
- All secrets via environment variables, never committed
- Auth: JWT with 15-minute access tokens, 7-day refresh

## Working style
- PRs under 400 lines preferred
- Every new endpoint needs an integration test
- Migrations require human review before merge`}</pre>
            <p className="text-xs text-espresso/50 leading-relaxed">
              This is the difference between an AI that knows your project and one that rediscovers it every session.
            </p>
          </div>
        ),
      },
    ],
  },
  // Steps 01–05
  {
    sections: [
      {
        label: "What you actually write",
        content: (
          <div>
            <p className="text-sm text-espresso/65 leading-relaxed mb-4">
              A spec is a markdown file. Not a prompt. Not a paragraph in Slack. A structured document the AI reads as both instruction and acceptance criteria.
            </p>
            <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`# Add webhook delivery with retry logic

## Intent
Users need to receive real-time events when their orders change
status. Missed deliveries must retry automatically.

## Acceptance Criteria
- [ ] POST to configured URL within 500ms of status change
- [ ] Retry up to 5 times with exponential backoff (1s, 2s, 4s, 8s, 16s)
- [ ] Dead-letter queue after 5 failures
- [ ] Delivery log queryable via GET /webhooks/:id/deliveries
- [ ] HMAC-SHA256 signature header on every request

## Constraints
- No new npm dependencies without approval
- Must not exceed 100ms added latency to the order update path
- All retries run async, never blocking the caller

## Out of scope
- UI for managing webhook endpoints (tracked in TICKET-84)`}</pre>
          </div>
        ),
      },
      {
        label: "What NOT to write",
        content: (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-label font-semibold text-red-400 mb-2">Vague prompt — produces inconsistent results</p>
              <p className="text-sm font-mono text-espresso/60 italic">&quot;Add webhooks so users can get notified about order changes&quot;</p>
            </div>
            <div className="space-y-2 text-sm text-espresso/60 leading-relaxed">
              <p>The vague version leaves every decision to the AI: retry logic or not? Signature verification or not? Sync or async? Each agent in each session will answer these differently. The spec version makes every decision explicit — the AI implements, not interprets.</p>
            </div>
          </div>
        ),
      },
      {
        label: "The three layers",
        content: (
          <div className="space-y-4">
            {[
              { name: "Foundation (configured once)", desc: "YAML rules enforced by CI: banned dependencies, file size limits, auth requirements. You set these up when the project starts. They apply to every task automatically.", color: "bg-gold" },
              { name: "Contracts (updated per feature)", desc: "Test suites and OpenAPI schemas. When the AI generates code, these define what passing looks like. You write the test expectations; the AI writes the implementation that satisfies them.", color: "bg-gold-warm" },
              { name: "Intent (written per task)", desc: "The .md file above. The primary artifact you create every day. Accepted by Linear, GitHub Issues, Notion, or any MCP-connected tool.", color: "bg-gold-dark" },
            ].map((layer) => (
              <div key={layer.name} className="flex gap-4 items-start">
                <div className={`flex-shrink-0 mt-1.5 w-2.5 h-2.5 rounded-sm ${layer.color}`} />
                <div>
                  <p className="text-xs font-semibold text-espresso mb-1">{layer.name}</p>
                  <p className="text-xs text-espresso/55 leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  {
    sections: [
      {
        label: "What the orchestrator does with your spec",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-espresso/65 leading-relaxed">
              The orchestrator reads your spec, pulls relevant codebase context, then breaks the work into parallel agent tasks. Here is what that decomposition looks like for the webhook example:
            </p>
            <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`Orchestrator reads: TICKET-77-webhooks.md
Querying knowledge graph for: webhook, order, delivery, retry
Relevant files: src/orders/service.ts, src/queue/worker.ts,
                prisma/schema.prisma, tests/orders.test.ts

Decomposed into 4 subtasks:
  [1] backend-dev     — webhook dispatcher + HMAC signing
  [2] backend-dev     — retry worker with exponential backoff
  [3] Database Opt.   — dead-letter queue schema migration
  [4] tester          — integration tests for all 5 retry cases

Running in parallel: tasks 1, 2, 3
Waiting on [1,2,3] before: task 4`}</pre>
          </div>
        ),
      },
      {
        label: "Why no agent works blind",
        content: (
          <div className="space-y-3 text-sm text-espresso/65 leading-relaxed">
            <p>Before any agent generates code, the orchestrator runs semantic search across the full codebase graph. Each agent receives:</p>
            <ul className="space-y-2">
              {[
                "The relevant existing files (not the whole repo — only what affects this task)",
                "Prior architectural decisions stored in memory (e.g. 'we use BullMQ for queues, not raw Redis')",
                "The security constraints from the Foundation layer",
                "The acceptance criteria from your spec, verbatim",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-gold-dark" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    sections: [
      {
        label: "What runs before you open the PR",
        content: (
          <div className="space-y-3">
            <p className="text-sm text-espresso/65 leading-relaxed mb-4">
              This is the full automated review sequence. None of it requires human attention. If anything fails, the agent fixes and retries before escalating.
            </p>
            {[
              { check: "Unit tests pass", detail: "Agent runs the test suite it wrote against its own implementation. Failures trigger self-correction, up to 3 iterations.", status: "auto" },
              { check: "Integration tests pass", detail: "The tester agent runs end-to-end scenarios: all 5 retry cases, HMAC verification, dead-letter queue overflow.", status: "auto" },
              { check: "Spec compliance", detail: "A separate reviewer agent reads the implementation against your original .md spec, line by line. Checks every acceptance criterion.", status: "auto" },
              { check: "Security scan", detail: "Dedicated security agent checks for: hardcoded secrets, SQL injection vectors, missing input validation, OWASP top 10 patterns.", status: "auto" },
              { check: "Dependency audit", detail: "Verifies no new dependencies were added without matching Foundation layer approval.", status: "auto" },
              { check: "Human reviews intent", detail: "You receive a summary: what was built, which tests passed, any tradeoffs the agent flagged. You review the 'what', not the 'how'.", status: "human" },
            ].map((item) => (
              <div key={item.check} className="flex gap-4 items-start py-3 border-b border-ivory-linen last:border-0">
                <span className={`flex-shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${item.status === "auto" ? "bg-espresso/8 text-espresso/50" : "bg-gold-dark/10 text-gold-dark"}`}>
                  {item.status === "auto" ? "AUTO" : "YOU"}
                </span>
                <div>
                  <p className="text-xs font-semibold text-espresso mb-1">{item.check}</p>
                  <p className="text-[11px] text-espresso/50 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  {
    sections: [
      {
        label: "What the human actually does at this stage",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-espresso/65 leading-relaxed">
              Automated tests verify the code. The human verifies the intent. These are different jobs. Here is what human verification looks like in practice:
            </p>
            {[
              { action: "Run the feature end to end", detail: "Not in a test harness — in the actual environment. Click through it. Trigger the edge cases. Try to break it in ways the spec did not anticipate." },
              { action: "Check the acceptance criteria one by one", detail: "Read the original spec. Confirm each criterion is actually satisfied, not just that a test for it passes. Tests can be wrong too." },
              { action: "Look for missing requirements", detail: "The spec captured what you knew at writing time. You know more now. Did you forget an error state? A loading state? A mobile layout? A permission edge case?" },
              { action: "Give feedback on the ticket", detail: "Approve with a note, annotate specific lines in the diff, or open a revision request. This feedback is the input to the next agent run — it becomes the next spec." },
            ].map((item) => (
              <div key={item.action} className="flex gap-4 items-start py-3 border-b border-ivory-linen last:border-0">
                <span className="flex-shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold-dark/10 text-gold-dark">YOU</span>
                <div>
                  <p className="text-xs font-semibold text-espresso mb-1">{item.action}</p>
                  <p className="text-[11px] text-espresso/50 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        label: "The difference between tests passing and the feature working",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-espresso/65 leading-relaxed">
              A 100% passing test suite is a necessary condition, not a sufficient one. Here is the gap that only a human can close:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { bad: "The retry logic retries 5 times as specced", good: "The retry delay feels right in production — 16 seconds on the last retry is too long for your users' use case" },
                { bad: "The HMAC signature validates correctly", good: "The error message when validation fails is clear enough for a developer to debug" },
                { bad: "All tests pass in CI", good: "The feature actually works in the staging environment with real data" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <div className="bg-ivory-parchment rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-label text-espresso/30 mb-1">Test says</p>
                    <p className="text-xs text-espresso/60 leading-snug">{row.bad}</p>
                  </div>
                  <div className="bg-gold-dark/5 rounded-lg p-3 border border-gold-dark/15">
                    <p className="text-[10px] uppercase tracking-label text-gold-dark mb-1">Human knows</p>
                    <p className="text-xs text-espresso/70 leading-snug">{row.good}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        label: "How feedback flows back into the next cycle",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-espresso/65 leading-relaxed">
              Human feedback on a ticket is not just a review comment. In the one-developer model it is the next spec. The cycle is:
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Human approves: ticket closes, memory updates, pattern stored",
                "Human annotates: annotation becomes a constraint in the next agent run",
                "Human requests revision: feedback is prepended to the original spec, orchestrator reruns with the corrected intent",
                "Human expands scope: new acceptance criteria added to the same ticket, agent picks up the delta",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start text-xs text-espresso/60 leading-relaxed">
                  <span className="flex-shrink-0 font-mono text-gold-dark">{String(i + 1)}.</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-ivory-parchment border border-ivory-linen rounded-xl p-4 mt-2">
              <p className="text-[10px] uppercase tracking-label text-gold-dark font-semibold mb-2">Key insight</p>
              <p className="text-xs text-espresso/65 leading-relaxed">
                The human is never reviewing syntax. They are reviewing whether the system did the right thing. That is the only review that requires a human — and it is the only one a human should be doing.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    sections: [
      {
        label: "What gets stored after this task",
        content: (
          <div>
            <p className="text-sm text-espresso/65 leading-relaxed mb-4">
              After the PR merges, the session-end hook stores a structured memory entry. Here is what that looks like:
            </p>
            <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`{
  "task": "TICKET-77: webhook delivery with retry",
  "pattern": "async-queue-retry",
  "decision": "used BullMQ with exponential backoff",
  "alternatives_rejected": ["raw Redis LPUSH", "pg-boss"],
  "reason": "BullMQ already in use for email queue (consistency)",
  "files_touched": ["src/webhooks/", "src/queue/worker.ts"],
  "test_coverage": "92% on new code",
  "security_findings": 0,
  "timestamp": "2026-06-01T14:32:00Z"
}`}</pre>
          </div>
        ),
      },
      {
        label: "How it helps the next task",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-espresso/65 leading-relaxed">
              Three weeks later, a new ticket asks for &quot;email delivery with retry.&quot; The orchestrator finds the webhook memory entry via semantic search and injects it as context before any agent runs:
            </p>
            <div className="bg-ivory-parchment border border-ivory-linen rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-label text-gold-dark font-semibold mb-2">Memory injected into agent context</p>
              <p className="text-xs font-mono text-espresso/60 leading-relaxed">
                [MEMORY] Prior task TICKET-77 used BullMQ for async retry with exponential backoff. Decision: consistency with existing email queue. Pattern: async-queue-retry. Relevant files: src/queue/worker.ts.
              </p>
            </div>
            <p className="text-xs text-espresso/50 leading-relaxed">
              The agent does not rediscover BullMQ. It does not consider alternatives you already rejected. It builds on what already exists. This is the compounding advantage that session-scoped tools cannot replicate.
            </p>
          </div>
        ),
      },
    ],
  },
];

const STEPS = [
  {
    num: "00",
    title: "Project setup: done once, applies to every task forever",
    body: "Before the repeating cycle begins, configure the infrastructure that governs all AI work on this project: initiate an AI orchestration layer, write the architectural constraint file, scaffold the contract test structure, connect your project management tool via MCP, and write the project identity file. This takes about an hour. After this, you only update it as the project evolves.",
    tag: "One-time setup",
    isSetup: true,
  },
  {
    num: "01",
    title: "Write what to build, not how to build it",
    body: "Write a markdown file — a Linear ticket, a GitHub Issue, a Notion page — describing the business problem, acceptance criteria, and what must not happen. The architectural constraints and contract tests are already in place from project setup. Your job per task is the intent document.",
    tag: "Judgment + specification",
  },
  {
    num: "02",
    title: "AI generates implementation with full codebase context",
    body: "The orchestrator reads the spec, pulls relevant code and prior decisions via semantic search, and delegates to specialized agents. No agent works blind — the entire dependency graph, past architectural choices, and security requirements are in context before a single line is written.",
    tag: "Generation layer",
  },
  {
    num: "03",
    title: "Verification runs before a human sees anything",
    body: "Tests run. Security scanners run. A reviewer agent reads the output against the original spec. An independent security agent checks for vulnerability patterns. All of this completes automatically. By the time you open the pull request, it has already passed multiple non-human reviews.",
    tag: "Verification layer",
  },
  {
    num: "04",
    title: "Human tests the feature and closes the loop on the ticket",
    body: "Tests passing is not the same as the feature working. The human runs it, uses it, and tries the edge cases that were never written down. This is where intent drift gets caught before production — not 'does the code match the spec' but 'does the spec match what we actually needed.' Feedback goes directly back to the ticket: approve, annotate, or request revision. That feedback becomes the next iteration's spec.",
    tag: "Human verification",
  },
  {
    num: "05",
    title: "The system gets smarter with each task",
    body: "Patterns from this work are stored in organizational memory. The next task starts with that context already loaded. Over weeks, the AI accumulates domain knowledge — your conventions, your past decisions, your known debt — that no session-scoped tool can develop.",
    tag: "Learning layer",
  },
];

const SPEC_LEVELS = [
  {
    level: "Foundation",
    title: "Architectural Constraints",
    desc: "YAML/TOML rules: banned dependencies, file size limits, auth requirements. Enforced automatically by CI linters — never reviewed by a human.",
    w: "100%",
    color: "bg-gold",
    modalLabel: "Example: .constraints.yaml",
    modalContent: (
      <div className="space-y-4">
        <p className="text-sm text-espresso/65 leading-relaxed">
          One file, committed to the repo root. Every AI-generated change must pass these rules before it reaches human review.
        </p>
        <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`# .constraints.yaml
# Set once. Apply to every task forever.

dependencies:
  banned:
    - moment        # use date-fns or Temporal
    - lodash        # use native array/object methods
    - request       # use fetch or axios
  require_approval_for_new: true

files:
  max_lines: 500
  no_write_to:
    - src/styles/globals.css  # design system locked
    - prisma/migrations/      # migrations require review

api:
  rate_limits:
    default: 100/min
    authenticated: 1000/min
  require_auth_on:
    - /api/admin/*
    - /api/payments/*

security:
  no_hardcoded_secrets: true
  require_input_validation: true
  ban_eval: true
  ban_exec: true`}</pre>
        <p className="text-xs text-espresso/45 leading-relaxed">
          The AI reads this before generating any code. Violations are caught by CI automatically — no human needs to check.
        </p>
      </div>
    ),
  },
  {
    level: "Contracts",
    title: "Behavioral Contracts",
    desc: "OpenAPI schemas, JSON Schema, formal test suites. These are the ground truth for whether an agent's output succeeded.",
    w: "72%",
    color: "bg-gold-warm",
    modalLabel: "Example: test contract for a feature",
    modalContent: (
      <div className="space-y-4">
        <p className="text-sm text-espresso/65 leading-relaxed">
          You write what success looks like. The AI writes the code that makes it pass. This is the boundary between human judgment and machine execution.
        </p>
        <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`// tests/webhooks.contract.test.ts
// Written by the human. Implemented by the AI.

describe('Webhook delivery', () => {
  it('delivers to configured URL within 500ms', async () => {
    const delivery = await triggerWebhook(testOrder)
    expect(delivery.latencyMs).toBeLessThan(500)
    expect(delivery.status).toBe('delivered')
  })

  it('retries with exponential backoff on failure', async () => {
    mockEndpoint.failNextN(3)
    const delivery = await triggerWebhook(testOrder)
    expect(delivery.attempts).toBe(4)
    expect(delivery.delays).toEqual([1000, 2000, 4000])
  })

  it('sends to dead-letter queue after 5 failures', async () => {
    mockEndpoint.alwaysFail()
    await triggerWebhook(testOrder)
    const dlq = await getDeadLetterQueue()
    expect(dlq).toHaveLength(1)
    expect(dlq[0].reason).toBe('max_retries_exceeded')
  })

  it('includes HMAC-SHA256 signature on every request', async () => {
    const delivery = await triggerWebhook(testOrder)
    const sig = delivery.headers['x-signature']
    expect(verifyHMAC(sig, testOrder, process.env.WEBHOOK_SECRET))
      .toBe(true)
  })
})`}</pre>
        <p className="text-xs text-espresso/45 leading-relaxed">
          The AI generates the dispatcher, retry worker, and queue logic. These tests define done. If they pass, the feature is complete.
        </p>
      </div>
    ),
  },
  {
    level: "Intent",
    title: "Intent Documents",
    desc: "A markdown file: business problem, user context, acceptance criteria. Written in Linear, GitHub Issues, Notion, or a plain .md file. This is what the human writes every day.",
    w: "50%",
    color: "bg-gold-dark",
    modalLabel: "Example: feature spec .md file",
    modalContent: (
      <div className="space-y-4">
        <p className="text-sm text-espresso/65 leading-relaxed">
          This is the spec for the same webhook feature shown in the Contracts example above. The human writes this in about 10 minutes. The AI reads it as both instruction and acceptance criteria.
        </p>
        <pre className="bg-espresso text-gold text-xs font-mono rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre">{`# Add webhook delivery with retry logic

## Intent
Users need real-time events when their orders change status.
Missed deliveries must retry automatically.

## Acceptance Criteria
- [ ] POST to configured URL within 500ms of status change
- [ ] Retry up to 5x with exponential backoff (1s, 2s, 4s, 8s, 16s)
- [ ] Dead-letter queue after 5 failures
- [ ] Delivery log queryable via GET /webhooks/:id/deliveries
- [ ] HMAC-SHA256 signature header on every request

## Constraints
- No new npm dependencies without approval
- Must not exceed 100ms added latency to the order update path
- All retries run async, never blocking the caller

## Out of scope
- UI for managing webhook endpoints (tracked in TICKET-84)`}</pre>
        <div className="bg-ivory-parchment border border-ivory-linen rounded-xl p-4 mt-2">
          <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-2">Where to write it</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-espresso/60">
            {["Linear ticket", "GitHub Issue", "Notion page", "Local .md file", "Jira ticket", "Any MCP-connected tool"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gold-dark/50 flex-shrink-0" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

interface ModalProps {
  label: string;
  title: string;
  tag: string;
  sections: { label: string; content: React.ReactNode }[];
  onClose: () => void;
}

function ContentModal({ label, title, tag, sections, onClose }: ModalProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={reduce ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-espresso/70"
        onClick={onClose}
        initial={reduce ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative bg-ivory-warm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        initial={reduce ? {} : { opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: expo }}
      >
        <div className="sticky top-0 bg-ivory-warm/95 backdrop-blur-sm border-b border-ivory-linen px-8 py-5 flex items-start justify-between gap-4 rounded-t-2xl z-10">
          <div>
            <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-1">{label}</p>
            <h3 className="text-base font-semibold text-espresso leading-snug max-w-lg">{title}</h3>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-8 h-8 rounded-full border border-ivory-linen flex items-center justify-center text-espresso/40 hover:text-espresso hover:border-espresso/30 transition-colors text-sm" aria-label="Close">✕</button>
        </div>
        <div className="px-8 py-6 space-y-8">
          {sections.map((s) => (
            <div key={s.label}>
              <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-4">{s.label}</p>
              {s.content}
            </div>
          ))}
        </div>
        <div className="px-8 py-5 border-t border-ivory-linen flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-label text-espresso/30">{tag}</span>
          <button onClick={onClose} className="text-xs text-espresso/40 hover:text-espresso transition-colors">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type ModalState = { kind: "step"; index: number } | { kind: "spec"; index: number } | null;

export function OperatingModel() {
  const reduce = useReducedMotion();
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <section className="bg-ivory-warm px-8 md:px-16 lg:px-24 py-24 md:py-32 border-b border-ivory-linen">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-20"
        >
          <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-4">The Operating Model</p>
          <h2 className="text-3xl md:text-5xl font-semibold text-espresso tracking-tight mb-5">
            What Makes It Work
          </h2>
          <p className="text-espresso/55 max-w-2xl font-light leading-relaxed">
            The pattern across successful one-developer companies is not &quot;use AI tools.&quot; It is a specific operating model where the human genuinely relinquishes syntax authorship.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          <motion.div
            className="absolute left-[19px] top-10 w-px bg-ivory-linen origin-top"
            style={{ bottom: "2rem" }}
            initial={reduce ? {} : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.4, ease: expo }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={reduce ? {} : { opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: expo }}
              className={`flex gap-8 py-8 border-b last:border-0 group ${step.isSetup ? "border-dashed border-ivory-linen/80" : "border-ivory-linen"}`}
            >
              <button
                onClick={() => setModal({ kind: "step", index: i })}
                className={`flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center text-[11px] font-semibold z-10 relative transition-all duration-300 cursor-pointer ${step.isSetup ? "border border-dashed border-gold-dark/40 bg-ivory-warm text-gold-dark/60 hover:bg-gold-dark hover:border-gold-dark hover:text-ivory" : "border border-ivory-linen bg-ivory-warm text-gold-dark hover:bg-gold-dark hover:border-gold-dark hover:text-ivory"}`}
                aria-label={`Open detailed view for step ${step.num}`}
              >
                {step.num}
              </button>
              <div className="flex-1 pt-1">
                {step.isSetup && (
                  <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/30 mb-2">One-time setup</p>
                )}
                <button onClick={() => setModal({ kind: "step", index: i })} className="text-left group/title">
                  <h3 className={`text-base md:text-lg font-semibold mb-2 tracking-tight group-hover/title:text-gold-dark transition-colors ${step.isSetup ? "text-espresso/70" : "text-espresso"}`}>
                    {step.title}
                  </h3>
                </button>
                <p className="text-sm text-espresso/60 leading-relaxed mb-3 max-w-2xl">{step.body}</p>
                <div className="flex items-center gap-3">
                  <span className={`inline-block text-[10px] uppercase tracking-label font-semibold px-2 py-0.5 border rounded-sm ${step.isSetup ? "text-espresso/40 border-espresso/15" : "text-gold-dark border-gold-dark/30"}`}>{step.tag}</span>
                  <button onClick={() => setModal({ kind: "step", index: i })} className="text-[10px] uppercase tracking-label text-espresso/30 hover:text-gold-dark transition-colors">
                    {step.isSetup ? "See setup guide →" : "See example →"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pull quote */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: expo }}
          className="mt-20 pt-10 border-t border-ivory-linen"
        >
          <p className="text-xl md:text-2xl lg:text-[28px] font-light text-espresso/70 leading-relaxed max-w-3xl">
            The model only works when the human genuinely relinquishes syntax authorship.
          </p>
          <p className="text-[10px] uppercase tracking-label text-espresso/30 mt-5">
            Core principle
          </p>
        </motion.div>

        {/* Spec stack */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mt-20"
        >
          <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-6">
            The Specification Stack: what the human writes, and what the AI enforces
          </p>
          <div className="space-y-3">
            {SPEC_LEVELS.map((level, i) => (
              <motion.div
                key={level.level}
                initial={reduce ? {} : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: expo }}
                className="flex items-start gap-6 group/spec"
              >
                <button
                  onClick={() => setModal({ kind: "spec", index: i })}
                  className="flex-shrink-0 w-16 text-[10px] font-bold text-gold-dark pt-2 text-left hover:underline"
                >
                  {level.level}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <motion.div
                      className={`h-1.5 rounded-full ${level.color}`}
                      initial={reduce ? {} : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease: expo }}
                      style={{ transformOrigin: "left", width: level.w }}
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-0.5">
                    <p className="text-xs font-semibold text-espresso">{level.title}</p>
                    <button
                      onClick={() => setModal({ kind: "spec", index: i })}
                      className="text-[10px] uppercase tracking-label text-espresso/30 hover:text-gold-dark transition-colors opacity-0 group-hover/spec:opacity-100"
                    >
                      See example →
                    </button>
                  </div>
                  <p className="text-xs text-espresso/50 leading-relaxed max-w-xl">{level.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-[10px] text-espresso/35 mt-5">
            Bar width represents scope. Foundation governs every line of code; Intent governs individual features. Click any layer label to see an example.
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {modal?.kind === "step" && (
          <ContentModal
            label={`Step ${STEPS[modal.index].num}`}
            title={STEPS[modal.index].title}
            tag={STEPS[modal.index].tag}
            sections={STEP_DETAILS[modal.index].sections}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.kind === "spec" && (
          <ContentModal
            label={`Specification Layer: ${SPEC_LEVELS[modal.index].level}`}
            title={SPEC_LEVELS[modal.index].title}
            tag={SPEC_LEVELS[modal.index].modalLabel}
            sections={[{ label: SPEC_LEVELS[modal.index].modalLabel, content: SPEC_LEVELS[modal.index].modalContent }]}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
