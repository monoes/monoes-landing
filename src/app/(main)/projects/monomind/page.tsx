import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { OrgSimulation } from "@/components/demos/OrgSimulation";
import { MonographDemo } from "@/components/demos/MonographDemo";
import { ScheduledOrgDemo, type ScheduledOrgConfig } from "@/components/demos/ScheduledOrgDemo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const githubPatrolConfig: ScheduledOrgConfig = {
  eyebrow: "Scheduled Org · github-patrol",
  description: "Wakes every hour, triages new GitHub issues, fixes what it can, and asks before merging.",
  createCmd: [
    '/mastermind:createorg --name github-patrol --schedule 1h \\',
    '--goal "Read open GitHub issues every hour, fix bugs, open PRs"',
  ],
  runCmd: "/mastermind:runorg --org github-patrol",
  beats: [
    {
      icon: "⏰",
      label: "01 · Wake",
      title: "Org wakes on schedule",
      kind: "clock",
      clock: { time: "14:00:00", sub: "scheduled · every 1 hour", cycleTag: "Cycle 5 of ongoing" },
    },
    {
      icon: "🐙",
      label: "02 · Fetch",
      title: "GitHub issues scanned",
      kind: "issues",
      issues: [
        { num: "#47", type: "feat", text: "dark mode support" },
        { num: "#46", type: "bug", text: "auth session timeout" },
        { num: "#45", type: "bug", text: "file upload fails >10MB" },
      ],
    },
    {
      icon: "⚙️",
      label: "03 · Work",
      title: "Agents execute in parallel",
      kind: "worklines",
      workLines: [
        { role: "[Arch]", text: "designing dark mode token system" },
        { role: "[Dev]", text: "fixing session TTL · auth.ts:142" },
        { role: "[Dev]", text: "patching upload limit · api/files.ts" },
        { role: "[QA]", text: "✓ 24 tests pass · 0 failures", ok: true },
        { role: "[Rev]", text: "✓ PR #52 #53 approved", ok: true },
        { role: "[Ops]", text: "✓ staging deployed · health OK", ok: true },
      ],
    },
    {
      icon: "📱",
      label: "04 · HIL",
      title: "Human-in-the-loop",
      kind: "telegram",
      telegram: {
        botName: "monomind · github-patrol",
        lines: [
          { ok: true, text: "#46 auth timeout: fixed (PR #52)" },
          { ok: true, text: "#45 file upload: fixed (PR #53)" },
          { pending: true, text: "#47 dark mode: in review" },
        ],
        question: "Approve merging PR #52 and #53 to main?",
        buttons: [
          { label: "✅ Approve & merge both", approve: true },
          { label: "👀 Review diffs first" },
          { label: "⏭ Skip this cycle" },
        ],
      },
    },
  ],
  timerLabel: "next cycle in",
  timerStart: "59:47",
  ticking: true,
  statusLine: "↺ github-patrol · cycle 5 complete · 2 PRs awaiting approval",
};

const contentSquadConfig: ScheduledOrgConfig = {
  eyebrow: "Scheduled Org · content-squad",
  description: "Researches a topic, writes the post, packages it with art and social copy, then asks before publishing.",
  createCmd: [
    '/mastermind:createorg --name content-squad \\',
    '--goal "Research, write, and publish one blog post + social content weekly"',
  ],
  runCmd: "/mastermind:runorg --org content-squad",
  beats: [
    {
      icon: "📡",
      label: "01 · Research",
      title: "Topics sourced autonomously",
      kind: "worklines",
      workLines: [
        { role: "[Scout]", text: "scanning Hacker News · arXiv · X" },
        { role: "[Scout]", text: '✓ topic: "Autonomous engineering orgs"', ok: true },
      ],
    },
    {
      icon: "✍️",
      label: "02 · Write",
      title: "2,400-word post drafted",
      kind: "worklines",
      workLines: [
        { role: "[Writer]", text: "drafting outline · 7 sections" },
        { role: "[Writer]", text: "writing body · examples · snippets" },
        { role: "[Editor]", text: "✓ SEO score 91 · readability A", ok: true },
      ],
    },
    {
      icon: "🖼️",
      label: "03 · Package",
      title: "Images + social copy",
      kind: "worklines",
      workLines: [
        { role: "[Design]", text: "generating hero image via Gemini" },
        { role: "[Social]", text: "✓ LinkedIn + X posts drafted", ok: true },
      ],
    },
    {
      icon: "📱",
      label: "04 · HIL + Publish",
      title: "You approve. Agents publish.",
      kind: "telegram",
      telegram: {
        botName: "monomind · content-squad",
        lines: [
          { ok: true, text: 'Post ready: "Autonomous engineering orgs"' },
          { ok: true, text: "2,412 words · SEO 91 · hero image attached" },
          { pending: true, text: "LinkedIn + X posts queued · awaiting go" },
        ],
        question: "Publish to blog and schedule social posts?",
        buttons: [
          { label: "🚀 Publish now", approve: true },
          { label: "✏️ Edit draft first" },
          { label: "⏭ Skip this week" },
        ],
      },
    },
  ],
  timerLabel: "next monday in",
  timerStart: "6d 14h 52m",
  ticking: false,
  statusLine: "↺ content-squad · post queued · social posts awaiting approval",
};

export const metadata: Metadata = {
  title: "Monomind: Open-source autonomous AI agent orchestration",
  description:
    "Hire an AI team. Set a goal. Walk away. An open-source CLI and MCP server for Claude Code, OpenCode, Antigravity, Kimi Code and Codex, with persistent memory, standing agent orgs, and a codebase knowledge graph. Apache-2.0, $0.",
  alternates: { canonical: "/projects/monomind" },
  openGraph: {
    title: "Monomind: Autonomous AI agent orchestration, $0",
    description:
      "Standing agent orgs, persistent memory, and a codebase knowledge graph for the AI coding tools you already use. Install once, tell it the outcome you want.",
  },
};

export default function MonomindPage() {
  const project = getProject("monomind");
  if (!project) notFound();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Monomind",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Open-source CLI and MCP server that adds persistent memory, standing agent orgs, and a codebase knowledge graph to Claude Code, OpenCode, Antigravity, Kimi Code and Codex.",
    url: "https://monoes.me/projects/monomind",
    downloadUrl: "https://github.com/monoes/monomind",
    softwareVersion: "2.24.3",
    applicationSubCategory: "AI Agent Orchestration",
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    author: {
      "@type": "Organization",
      name: "Monoes",
      url: "https://monoes.me",
    },
  };

  return (
    <>
      <ProjectPageLayout
        project={project}
        demo={
          <div className="flex flex-col gap-6">
            <OrgSimulation />
            <ScheduledOrgDemo config={githubPatrolConfig} />
            <ScheduledOrgDemo config={contentSquadConfig} />
            <MonographDemo />
          </div>
        }
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
