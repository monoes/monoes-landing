import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { ClipboardSim } from "@/components/demos/ClipboardSim";
import { notFound } from "next/navigation";

export default function MonoClipPage() {
  const project = getProject("mono-clip");
  if (!project) notFound();
  return <ProjectPageLayout project={project} demo={<ClipboardSim />} />;
}
