import type { Project } from "@/lib/projects";
import type { ReactNode } from "react";
import { ProjectHero } from "./ProjectHero";
import { FeatureGrid } from "./FeatureGrid";
import { CLISection } from "./CLISection";
import { CrossLinks } from "./CrossLinks";
import { TerminalBlock } from "@/components/ui/TerminalBlock";

export function ProjectPageLayout({ project, demo }: { project: Project; demo: ReactNode }) {
  return (
    <main className="pt-0">
      <ProjectHero project={project} />

      {/* Demo, dark so canvas/widget stands out naturally */}
      <section className="bg-espresso px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-xs uppercase tracking-label font-medium" style={{ color: project.accent }}>
            Interactive Demo
          </p>
          {demo}
        </div>
      </section>

      <FeatureGrid project={project} />

      {project.cli && <CLISection data={project.cli} accent={project.accent} />}

      {/* Install */}
      <section className="bg-ivory-warm px-4 sm:px-6 md:px-8 py-16 sm:py-20 border-t border-ivory-linen">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-xs uppercase tracking-label font-medium text-gold-dark">Get Started</p>
          <h2 className="mb-8 text-2xl font-semibold text-espresso tracking-tight">
            Up and running in seconds.
          </h2>
          <TerminalBlock lines={project.install} />
        </div>
      </section>

      <CrossLinks current={project.id} />
    </main>
  );
}
