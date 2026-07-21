import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { OrgSimulation } from "@/components/demos/OrgSimulation";
import { SwarmSimulation } from "@/components/demos/SwarmSimulation";
import { MonographDemo } from "@/components/demos/MonographDemo";
import { notFound } from "next/navigation";

export default function MonomindPage() {
  const project = getProject("monomind");
  if (!project) notFound();
  return (
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
  );
}
