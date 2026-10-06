import Link from "next/link";
import { HeroDagVisual } from "./HeroDagVisual";
import { HeroKickerTypewriter } from "./HeroKickerTypewriter";
import { RevealHeading } from "./RevealHeading";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-espresso px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-28">
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[1fr_1.15fr] md:gap-8">
        <div className="max-w-lg">
          <p className="mb-5 flex items-center gap-2 font-mono text-[11px] text-gold">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            <HeroKickerTypewriter text="Open source · Apache-2.0 + MIT · self-hosted" />
          </p>
          <RevealHeading
            as="h1"
            className="mb-6 text-[clamp(2.75rem,8vw,8.75rem)] font-light leading-[0.98] tracking-tight text-ivory"
          >
            Automate the work.
            <br />
            <em className="font-normal not-italic text-gold-warm">Orchestrate</em> the company.
          </RevealHeading>
          <p className="mb-8 text-base font-light leading-relaxed text-ivory/60">
            Mono Agent runs the workflows: browser automation, data, scheduled jobs. Monomind runs
            the org that builds everything else. Self-host both for $0, or hire Monoes Workforce
            to run it for your business.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/monoes/monomind"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold-warm px-6 py-3 text-xs font-bold uppercase tracking-widest text-espresso transition-all hover:bg-gold hover:shadow-[0_0_16px_rgba(232,184,74,0.3)]"
            >
              ★ Star on GitHub
            </a>
            <Link
              href="/workforce"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ivory/80 transition-all hover:border-gold hover:text-gold"
            >
              Book a Discovery call →
            </Link>
          </div>
        </div>
        <div className="md:-mr-6 lg:-mr-20">
          <HeroDagVisual />
        </div>
      </div>
    </section>
  );
}
