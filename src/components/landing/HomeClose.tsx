import Link from "next/link";
import { RevealHeading } from "./RevealHeading";

export function HomeClose() {
  return (
    <section className="border-t border-gold/10 bg-espresso-deep px-6 py-24 text-center md:px-12">
      <div className="mx-auto max-w-2xl">
        <RevealHeading as="h2" className="mb-8 text-3xl font-light leading-tight tracking-tight text-ivory md:text-5xl">
          Your company can run <em className="font-normal not-italic text-gold">itself.</em>
        </RevealHeading>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://github.com/monoes/monomind"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gold-warm px-6 py-3 text-xs font-bold uppercase tracking-widest text-espresso transition-all hover:bg-gold"
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
    </section>
  );
}
