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
