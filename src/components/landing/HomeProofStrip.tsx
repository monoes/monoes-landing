import type { ReactNode } from "react";
import { getAllRepoStats } from "@/lib/github";

function Stat({ label, stars }: { label: string; stars: number }) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm text-ivory/70">
      <span className="text-gold">★ {stars.toLocaleString()}</span>
      <span className="text-ivory/40">{label}</span>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-gold/25 px-3.5 py-1.5 font-mono text-[11px] text-gold">
      {children}
    </span>
  );
}

export async function HomeProofStrip() {
  const stats = await getAllRepoStats();
  const monomindStars = stats["monoes/monomind"]?.stars;
  const monoAgentStars = stats["monoes/mono-agent"]?.stars;

  return (
    <section className="border-y border-gold/15 bg-espresso-deep px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-5">
        {monomindStars != null && <Stat label="Monomind" stars={monomindStars} />}
        {monoAgentStars != null && <Stat label="Mono Agent" stars={monoAgentStars} />}
        <Badge>Monomind · Apache-2.0</Badge>
        <Badge>Mono Agent · MIT</Badge>
        <Badge>Self-hosted · $0</Badge>
      </div>
    </section>
  );
}
