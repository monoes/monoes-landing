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
  return <ProjectPageLayout project={project} demo={<WorkflowBuilder />} />;
}
