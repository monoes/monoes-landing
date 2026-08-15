import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/projects";

const architectureLinks: Record<string, string> = {
  "monomind":    "/projects/monomind/architecture",
  "mono-agent":  "/projects/mono-agent/architecture",
  "mono-clip":   "/projects/mono-clip/architecture",
  "monotask":    "/projects/monotask/architecture",
};

const heroMonkeys: Record<string, string> = {
  "mono-agent": "/images/monkey/coding-laptop.png",
  "monomind":   "/images/monkey/meditating-brain.png",
  "mono-clip":  "/images/monkey/clipboard-thumbsup.png",
  "monotask":   "/images/monkey/task-board.png",
};

const heroStats: Record<string, { label: string; value: string }[]> = {
  "mono-agent": [
    { label: "Workflow Nodes", value: "70+" },
    { label: "AI Models",      value: "200+" },
    { label: "Binary Size",    value: "~12MB" },
  ],
  "monomind": [
    { label: "CLI Commands",       value: "32" },
    { label: "Packages",           value: "8" },
    { label: "Background Workers", value: "8" },
  ],
  "mono-clip": [
    { label: "Binary Size",    value: "~8MB" },
    { label: "RAM Usage",      value: "~30MB" },
    { label: "Search Speed",   value: "<5ms" },
  ],
  "monotask": [
    { label: "Sync Protocol",  value: "CRDT" },
    { label: "Crypto",         value: "Ed25519" },
    { label: "Servers Needed", value: "0" },
  ],
};

export function ProjectHero({ project }: { project: Project }) {
  const stats = heroStats[project.id] ?? [];
  const monkey = heroMonkeys[project.id] ?? "/images/monkey/hero-full.jpg";
  const archLink = architectureLinks[project.id];

  return (
    <section className="relative overflow-hidden bg-espresso px-6 sm:px-8 pt-28 sm:pt-32 pb-6 border-b border-gold/15">
      {/* Subtle radial glow behind monkey */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full blur-3xl opacity-[0.12]"
        style={{ background: project.accent }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-label font-medium text-gold/70 transition-colors hover:text-gold"
        >
          ← Monoes
        </Link>

        <div className="flex items-end gap-12">
          {/* Left - text */}
          <div className="flex-1 pb-16">
            <p className="mb-3 text-xs uppercase tracking-label font-semibold" style={{ color: project.accent }}>
              {project.number} · {project.language}
            </p>
            <h1 className="mb-4 text-5xl font-semibold text-ivory tracking-tight md:text-6xl lg:text-7xl leading-none">
              {project.name}
            </h1>
            <p className="mb-8 max-w-lg text-lg text-ivory/70 font-light leading-relaxed">
              {project.tagline}
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <a
                href={`https://github.com/${project.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold text-espresso font-semibold rounded-lg px-6 py-2.5 text-sm transition-opacity hover:opacity-90"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
              <button
                className="inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors"
                style={{ borderColor: `${project.accent}60`, color: project.accent }}
              >
                Install Guide
              </button>
              {archLink && (
                <Link
                  href={archLink}
                  className="inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors"
                  style={{ borderColor: `${project.accent}40`, color: project.accent }}
                >
                  Architecture →
                </Link>
              )}
            </div>

            {/* Stat bar */}
            {stats.length > 0 && (
              <div className="inline-flex divide-x divide-gold/15 overflow-hidden rounded-xl border border-gold/20 bg-espresso-deep/90">
                {stats.map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-start gap-1 px-6 py-4">
                    <span
                      className="text-2xl font-semibold leading-none tracking-tight text-gold"
                    >
                      {value}
                    </span>
                    <span className="text-[10px] uppercase tracking-label font-medium text-ivory/55">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - monkey image centered vertically */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0 self-center">
            <div className="relative rounded-2xl overflow-hidden p-2 bg-gradient-to-b from-gold/10 to-transparent border border-gold/20 shadow-2xl backdrop-blur-sm">
              <Image
                src={monkey}
                alt={`${project.name} mascot`}
                width={360}
                height={360}
                className="relative z-10 rounded-xl object-contain"
                style={{ width: 360, height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
