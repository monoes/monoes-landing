import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { OrgSimulation } from "@/components/demos/OrgSimulation";
import { SwarmSimulation } from "@/components/demos/SwarmSimulation";
import { MonographDemo } from "@/components/demos/MonographDemo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monomind: Open-source autonomous AI agent orchestration",
  description:
    "Hire an AI team. Set a goal. Walk away. Self-hosted autonomous Claude Code orchestration with persistent memory, self-coordinating agent orgs, and a codebase knowledge graph. Apache-2.0, $0.",
  alternates: { canonical: "/projects/monomind" },
  openGraph: {
    title: "Monomind: Autonomous AI agent orchestration, $0",
    description:
      "Self-coordinating agent orgs, persistent local memory, and a codebase knowledge graph. Install once, tell it the outcome you want.",
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
      "Open-source autonomous AI agent orchestration with persistent memory, self-coordinating agent orgs, and a codebase knowledge graph.",
    url: "https://monoes.me/projects/monomind",
    downloadUrl: "https://github.com/monoes/monomind",
    softwareVersion: "2.9.2",
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
