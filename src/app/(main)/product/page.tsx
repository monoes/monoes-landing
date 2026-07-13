import { HeroSection } from "@/components/landing/HeroSection";
import { ProjectSection } from "@/components/landing/ProjectSection";
import { CommunityTeaser } from "@/components/landing/CommunityTeaser";
import { ScrollMonkey } from "@/components/ui/ScrollMonkey";
import { projects } from "@/lib/projects";

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
