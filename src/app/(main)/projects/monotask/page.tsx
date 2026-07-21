import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { KanbanSync } from "@/components/demos/KanbanSync";
import { notFound } from "next/navigation";

export default function MonoTaskPage() {
  const project = getProject("monotask");
  if (!project) notFound();
  return <ProjectPageLayout project={project} demo={<KanbanSync />} />;
}
