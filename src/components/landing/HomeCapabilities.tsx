import { getProject } from "@/lib/projects";

function ProductBlock({ productId }: { productId: "monomind" | "mono-agent" }) {
  const project = getProject(productId);
  if (!project) return null;
  const features = project.features.slice(0, 4);
  const snippet = project.install[0];

  return (
    <div className="rounded-2xl border p-7" style={{ borderColor: `${project.accent}40` }}>
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: project.accent }}>
        {project.name}
      </p>
      <p className="mb-6 text-sm text-ivory/50">{project.tagline}</p>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title}>
            <div className="mb-1 text-sm font-medium text-ivory">
              {f.icon} {f.title}
            </div>
            <p className="text-xs leading-relaxed text-ivory/50">{f.description}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-gold/15 bg-black/30 px-4 py-3 font-mono text-[11px] text-ivory/75">
        <div>
          <span style={{ color: project.accent }}>$</span> {snippet.command}
        </div>
        {snippet.output && <div className="text-ivory/40">{snippet.output}</div>}
      </div>
    </div>
  );
}

export function HomeCapabilities() {
  return (
    <section className="border-t border-gold/10 bg-espresso-deep px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Two engines</p>
        <h2 className="mb-14 max-w-xl text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl">
          Pick the engine for the shape of the work.
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ProductBlock productId="monomind" />
          <ProductBlock productId="mono-agent" />
        </div>
      </div>
    </section>
  );
}
