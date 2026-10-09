import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { WorkflowBuilder } from "@/components/demos/WorkflowBuilder";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mono Agent: Local-first browser & workflow automation",
  description:
    "Local-first n8n alternative in a single Go binary. 160+ workflow nodes, your own logged-in Chrome, multi-profile isolation, human-in-the-loop approvals and a visual DAG editor. All data stays on your machine.",
  alternates: { canonical: "/projects/mono-agent" },
};

export default function MonoAgentPage() {
  const project = getProject("mono-agent");
  if (!project) notFound();

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
      "Local-first browser and workflow automation. 160+ workflow nodes, your own logged-in Chrome, multi-profile isolation, human-in-the-loop approvals and a visual DAG editor.",
    url: "https://monoes.me/projects/mono-agent",
    downloadUrl: "https://github.com/monoes/mono-agent",
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
