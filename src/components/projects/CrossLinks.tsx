import Link from "next/link";
import { MagneticCard } from "@/components/ui/MagneticCard";
import { projects } from "@/lib/projects";

export function CrossLinks({ current }: { current: string }) {
  const others = projects.filter((p) => p.id !== current);
  return (
    <section className="bg-espresso px-6 sm:px-8 py-20 border-t border-gold/15">
      <div className="mx-auto max-w-6xl">
        <p className="mb-8 text-xs uppercase tracking-label text-gold font-medium">Explore More Tools</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {others.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <MagneticCard className="rounded-xl border border-gold/20 bg-espresso-deep/90 p-6 shadow-soft transition-all duration-200 hover:border-gold/40 hover:shadow-soft-lg">
                <p className="mb-1 text-xs uppercase tracking-label font-medium" style={{ color: project.accent }}>{project.number}</p>
                <h3 className="mb-2 text-lg font-semibold text-ivory">{project.name}</h3>
                <p className="text-sm text-ivory/65 leading-relaxed">{project.tagline}</p>
              </MagneticCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
