import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { WorkflowBuilder } from "@/components/demos/WorkflowBuilder";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mono Agent: Self-hosted browser & workflow automation",
  description:
    "n8n meets Playwright. 70+ workflow nodes, stealth Chrome via Rod, multi-profile isolation, and a visual DAG editor. Fully self-hosted, zero cloud.",
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
      "Self-hosted browser and workflow automation. 70+ workflow nodes, stealth Chrome via Rod, multi-profile isolation, and a visual DAG editor.",
    url: "https://monoes.me/projects/mono-agent",
    downloadUrl: "https://github.com/monoes/mono-agent",
    applicationSubCategory: "Workflow Automation",
    license: "https://www.apache.org/licenses/LICENSE-2.0",
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
