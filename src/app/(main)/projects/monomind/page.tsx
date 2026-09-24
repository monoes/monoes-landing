import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { OrgSimulation } from "@/components/demos/OrgSimulation";
import { SwarmSimulation } from "@/components/demos/SwarmSimulation";
import { MonographDemo } from "@/components/demos/MonographDemo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monomind: Open-source memory, code graph and agent orgs for AI coding assistants",
  description:
    "Open-source (Apache-2.0) CLI and MCP server for Claude Code, Codex, OpenCode, Kimi Code and Antigravity: local SQLite memory, a tree-sitter code knowledge graph, local document search and policy-gated agent orgs.",
  alternates: { canonical: "/projects/monomind" },
  openGraph: {
    title: "Monomind: local memory, code graph and agent orgs for AI coding assistants",
    description:
      "Persistent local memory, a codebase knowledge graph and background agent orgs. Works with Claude Code, Codex, OpenCode, Kimi Code and Antigravity.",
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
      "Open-source CLI and MCP server that adds local SQLite memory, a codebase knowledge graph, local document search and policy-gated agent orgs to AI coding assistants.",
    url: "https://monoes.me/projects/monomind",
    downloadUrl: "https://github.com/monoes/monomind",
    softwareVersion: "2.16.2",
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
            <SwarmSimulation />
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
