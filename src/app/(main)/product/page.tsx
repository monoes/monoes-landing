import { HeroSection } from "@/components/landing/HeroSection";
import { ProjectSection } from "@/components/landing/ProjectSection";
import { CommunityTeaser } from "@/components/landing/CommunityTeaser";
import { ScrollMonkey } from "@/components/ui/ScrollMonkey";
import { projects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Four open-source AI tools you can self-host",
  description:
    "Monomind (agent orchestration), Mono Agent (browser automation), MonoClip (clipboard), MonoTask (P2P kanban). Apache-2.0 and MIT licensed, self-hostable, BYOK from zero.",
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
      <ScrollMonkey />
    </main>
  );
}
