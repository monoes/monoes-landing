import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { WorkflowBuilder } from "@/components/demos/WorkflowBuilder";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMonoAgentVersion } from "@/lib/versions";

export const metadata: Metadata = {
  title: "Mono Agent: Local-first n8n alternative in a single Go binary",
  description:
    "Open-source (MIT), local-first workflow automation in one Go binary: 100+ node types, human-in-the-loop approvals, an encrypted secrets vault, a visual editor, and an MCP server for AI agents. No Docker, no telemetry.",
  alternates: { canonical: "/projects/mono-agent" },
};

export default async function MonoAgentPage() {
  const project = getProject("mono-agent");
  if (!project) notFound();
  const version = await getMonoAgentVersion();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Mono Agent",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Open-source (MIT), local-first workflow automation in one Go binary: 100+ node types, human-in-the-loop approvals, an encrypted secrets vault, a visual editor, and an MCP server for AI agents. No Docker, no telemetry.",
    url: "https://monoes.me/projects/mono-agent",
    downloadUrl: "https://github.com/monoes/mono-agent/releases/latest",
    ...(version && { softwareVersion: version }),
    applicationSubCategory: "Workflow Automation",
    license: "https://opensource.org/licenses/MIT",
    author: {
      "@type": "Organization",
      name: "Monoes",
      url: "https://monoes.me",
    },
  };

  return (
    <>
      <ProjectPageLayout project={project} demo={<WorkflowBuilder />} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
