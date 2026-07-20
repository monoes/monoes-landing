import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { SwarmSimulation } from "@/components/demos/SwarmSimulation";
import { notFound } from "next/navigation";

export default function MonomindPage() {
  const project = getProject("monomind");
  if (!project) notFound();
  return <ProjectPageLayout project={project} demo={<SwarmSimulation />} />;
}
