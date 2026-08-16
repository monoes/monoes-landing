"use client";

export interface CLIGroup {
  title: string;
  description?: string;
  commands: string[];
}

export interface CLISectionData {
  binary: string;
  intro: string;
  aiNote: string;
  groups: CLIGroup[];
}

export function CLISection({ data, accent }: { data: CLISectionData; accent: string }) {
  return (
    <section className="bg-espresso px-8 py-20 border-t border-ivory/6">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-xs uppercase tracking-label font-medium" style={{ color: accent }}>
          CLI Reference
        </p>
        <h2 className="mb-3 text-2xl font-semibold text-ivory tracking-tight">
          Scriptable. Pipeable. AI-ready.
        </h2>
        <p className="mb-4 text-ivory/55 max-w-2xl leading-relaxed">{data.intro}</p>

        {/* AI note */}
        <div
          className="mb-12 flex items-start gap-3 rounded-xl border px-5 py-4 max-w-2xl"
          style={{ borderColor: `${accent}30`, background: `${accent}08` }}
        >
          <span className="mt-0.5 text-base" style={{ color: accent }}>⚡</span>
          <p className="text-sm text-ivory/70 leading-relaxed">{data.aiNote}</p>
        </div>

        {/* Command groups */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.groups.map((group) => (
            <div key={group.title} className="min-w-0">
              <h3 className="mb-1 text-sm font-semibold text-ivory/80">{group.title}</h3>
              {group.description && (
                <p className="mb-3 text-xs text-ivory/40 leading-relaxed">{group.description}</p>
              )}
              <pre className="overflow-x-auto rounded-lg bg-espresso-deep p-4 text-xs leading-relaxed text-ivory/55 font-mono">
                {group.commands.join("\n")}
              </pre>
            </div>
          ))}
        </div>

        {/* Binary badge */}
        <p className="mt-10 text-xs text-ivory/25 font-mono">
          $ {data.binary} --help
        </p>
      </div>
    </section>
  );
}
