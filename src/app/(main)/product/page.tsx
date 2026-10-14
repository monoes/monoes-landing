import { HeroSection } from "@/components/landing/HeroSection";
import { ProjectSection } from "@/components/landing/ProjectSection";
import { CommunityTeaser } from "@/components/landing/CommunityTeaser";
import { projects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Four AI tools you can run yourself",
  description:
    "Monomind (agent orchestration), Mono Agent (workflow automation), MonoClip (clipboard), MonoTask (P2P kanban). Free to run on your own machine.",
  alternates: { canonical: "/product" },
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div id="projects">
        {projects.map((project) => (
          <ProjectSection key={project.id} project={project} />
        ))}
      </div>
      <CommunityTeaser />
    </main>
  );
}
