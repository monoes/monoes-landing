import { RevealHeading } from "./RevealHeading";

const TABLE: { axis: string; relevance: string; lindy: string; crewai: string; monoes: string }[] = [
  { axis: "Deployment", relevance: "Cloud only", lindy: "Cloud only", crewai: "Self-hosted (core)", monoes: "Self-hosted" },
  {
    axis: "Memory / data",
    relevance: "Their cloud",
    lindy: "Their cloud",
    crewai: "Your infra, you wire it",
    monoes: "Local SQLite + local embeddings, on your machine",
  },
  {
    axis: "What it is",
    relevance: "Hosted no-code builder",
    lindy: "Hosted no-code builder",
    crewai: "A framework you code against",
    monoes: "An installable CLI + daemon",
  },
  {
    axis: "License",
    relevance: "Proprietary",
    lindy: "Proprietary",
    crewai: "MIT",
    monoes: "Apache-2.0 (Monomind) / MIT (Mono Agent)",
  },
];

export function HomeSecurity() {
  return (
    <section className="bg-ivory px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold-dark">Where this differs</p>
        <RevealHeading
          as="h2"
          className="mb-5 max-w-2xl text-3xl font-light leading-tight tracking-tight text-espresso md:text-4xl"
        >
          Where this actually differs.
        </RevealHeading>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-espresso/55">
          Relevance AI and Lindy are good tools. Neither publishes a self-hosted or private-VPC
          tier — checked on their own pricing pages, October 2026. Everything built on them runs
          on their infrastructure, with your data in their database. Monomind and Mono Agent are
          the opposite: orchestration, memory, and your data stay on hardware you control.
        </p>

        <div className="mb-6 overflow-x-auto rounded-xl border border-espresso/10">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-espresso/10 bg-ivory-warm">
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-espresso/35" />
                <th className="px-4 py-3 text-left font-medium text-espresso/55">Relevance AI</th>
                <th className="px-4 py-3 text-left font-medium text-espresso/55">Lindy</th>
                <th className="px-4 py-3 text-left font-medium text-espresso/55">CrewAI</th>
                <th className="px-4 py-3 text-left font-semibold text-gold-dark">Monoes</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((row, i) => (
                <tr key={row.axis} className={i < TABLE.length - 1 ? "border-b border-espresso/10" : ""}>
                  <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-espresso/40">
                    {row.axis}
                  </td>
                  <td className="px-4 py-3 text-espresso/65">{row.relevance}</td>
                  <td className="px-4 py-3 text-espresso/65">{row.lindy}</td>
                  <td className="px-4 py-3 text-espresso/65">{row.crewai}</td>
                  <td className="bg-gold-dark/5 px-4 py-3 font-medium text-espresso">{row.monoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-espresso/55">
          CrewAI is a different comparison. Its core is open-source and self-hosted too (MIT,
          verified against its GitHub license) — so hosting isn&apos;t what separates us. The
          difference is what you get on day one: CrewAI&apos;s core is a Python framework you write
          Agent/Task/Crew code against. Monomind installs as a working CLI with an org daemon,
          persistent memory, and a knowledge graph already wired up.
        </p>
        <p className="text-xs text-espresso/35">
          Checked October 2026. Deployment options and pricing change — verify against the
          vendor&apos;s current page before you quote this.
        </p>
      </div>
    </section>
  );
}
