import type { Metadata } from "next";
import Link from "next/link";
import { getAllRepoStats } from "@/lib/github";
import { StatsBar } from "@/components/community/StatsBar";
import { EcosystemGrid } from "@/components/community/EcosystemGrid";
import { ContributeSteps } from "@/components/community/ContributeSteps";
import { TechStack } from "@/components/community/TechStack";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join the Monoes open-source community. Contribute to Monomind, Mono Agent, MonoClip, and MonoTask. Every line is Apache-2.0, every contribution matters.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Monoes Community - Built in the open, shaped by the troop",
    description: "Every line of monoes is open source. Join the community on GitHub.",
  },
};

export default async function CommunityPage() {
  const stats = await getAllRepoStats();
  const totalStars = Object.values(stats).reduce((sum, s) => sum + s.stars, 0);

  return (
    <main>
      <section className="flex min-h-[50vh] items-center justify-center bg-ivory-warm px-8 pt-16 text-center border-b border-ivory-linen">
        <div>
          <p className="mb-4 text-xs uppercase tracking-label text-gold-dark font-medium">Open Source</p>
          <h1 className="mb-4 text-4xl font-semibold text-espresso md:text-5xl tracking-tight">
            Built in the open.<br />Shaped by the troop.
          </h1>
          <p className="mb-8 text-espresso/55 text-lg font-light">Every line of monoes is open source. Every contribution matters.</p>
          <div className="flex justify-center gap-3">
            <a href="https://github.com/monoes" target="_blank" rel="noopener noreferrer" className="bg-espresso text-ivory rounded-md px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80">
              View on GitHub ↗
            </a>
            <Link href="#contribute" className="rounded-md border border-espresso/30 px-5 py-2 text-sm text-espresso font-medium transition-colors hover:border-espresso">
              Contributing Guide
            </Link>
          </div>
        </div>
      </section>
      <StatsBar totalStars={totalStars} />
      <EcosystemGrid stats={stats} />
      <div id="contribute"><ContributeSteps /></div>

      {/* Discussions */}
      <section className="bg-ivory-warm px-8 py-20 border-t border-ivory-linen">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs uppercase tracking-label text-gold">Community Hub</p>
          <h2 className="mb-4 text-3xl font-semibold text-espresso tracking-tight">The conversation happens on GitHub Discussions.</h2>
          <p className="mb-10 text-espresso/55 text-lg font-light max-w-2xl">
            Ask questions, share ideas, propose new tools, or just say hello. The whole troop is there.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Q&A", desc: "Get help from contributors and maintainers", tag: "category:Q&A" },
              { label: "Ideas", desc: "Propose features, tools, or integrations", tag: "category:Ideas" },
              { label: "Show & Tell", desc: "Share what you built with monoes", tag: "category:Show+and+tell" },
            ].map((item) => (
              <a
                key={item.label}
                href={`https://github.com/monoes/monomind/discussions`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-ivory-linen bg-ivory p-5 transition-colors hover:border-gold/40"
              >
                <p className="mb-1 font-medium text-espresso group-hover:text-gold-dark transition-colors">{item.label}</p>
                <p className="text-sm text-gold-bronze">{item.desc}</p>
              </a>
            ))}
          </div>
          <div className="mt-8">
            <a
              href="https://github.com/monoes/monomind/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-espresso/30 px-5 py-2 text-sm text-espresso font-medium transition-colors hover:border-espresso"
            >
              Open Discussions ↗
            </a>
          </div>
        </div>
      </section>

      <TechStack />

      <section className="bg-ivory-parchment px-8 py-20 text-center border-t border-ivory-linen">
        <h2 className="mb-3 text-3xl font-semibold text-espresso tracking-tight">Every tool started with a single commit.</h2>
        <p className="mb-8 text-espresso/55 text-lg font-light">What will yours be?</p>
        <div className="flex justify-center gap-3">
          <a href="https://github.com/monoes" target="_blank" rel="noopener noreferrer" className="bg-espresso text-ivory inline-block rounded-md px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-80">
            Start Contributing →
          </a>
          <a href="https://github.com/monoes/monomind/discussions" target="_blank" rel="noopener noreferrer" className="inline-block rounded-md border border-espresso/30 px-6 py-2.5 text-sm font-medium text-espresso transition-colors hover:border-espresso">
            Join the Discussion ↗
          </a>
        </div>
      </section>
    </main>
  );
}
