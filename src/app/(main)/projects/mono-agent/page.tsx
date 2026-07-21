import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { WorkflowBuilder } from "@/components/demos/WorkflowBuilder";
import { notFound } from "next/navigation";

export default function MonoAgentPage() {
  const project = getProject("mono-agent");
  if (!project) notFound();
  return <ProjectPageLayout project={project} demo={<WorkflowBuilder />} />;
}
