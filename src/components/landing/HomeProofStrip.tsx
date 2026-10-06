import type { ReactNode } from "react";
import { getAllRepoStats } from "@/lib/github";

function StarTicker({ label, stars }: { label: string; stars: number }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-4xl font-bold leading-none text-gold md:text-5xl">
        {stars.toLocaleString()}
      </span>
      <span className="font-mono text-xs uppercase tracking-widest text-ivory/40">★ {label} stars</span>
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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-14 gap-y-6">
        {monomindStars != null && <StarTicker label="Monomind" stars={monomindStars} />}
        {monoAgentStars != null && <StarTicker label="Mono Agent" stars={monoAgentStars} />}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Badge>Monomind · Apache-2.0</Badge>
          <Badge>Mono Agent · MIT</Badge>
          <Badge>Self-hosted · $0</Badge>
        </div>
      </div>
    </section>
  );
}
