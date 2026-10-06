import { discoveryPackages, discoveryContactEmail, discoveryEmailBody } from "@/lib/workforce";

function mailtoHref(subject: string) {
  return `mailto:${discoveryContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(discoveryEmailBody)}`;
}

export function HomePlans() {
  return (
    <section className="border-t border-gold/10 bg-espresso-deep px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Two ways in</p>
        <h2 className="mb-14 max-w-xl text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl">
          Run it yourself, or have us run it for you.
        </h2>
        <div className="grid overflow-hidden rounded-2xl border border-gold/20 md:grid-cols-2">
          <div className="p-8 md:p-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
              Self-hosted · free forever
            </p>
            <h3 className="mb-3 text-xl font-light text-ivory">Deploy it yourself</h3>
            <p className="mb-7 text-sm leading-relaxed text-ivory/55">
              Monomind (Apache-2.0) and Mono Agent (MIT). Full source. Install in minutes. No usage
              caps, no monthly billing, no vendor relationship.
            </p>
            <a
              href="https://github.com/monoes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-ivory/80 transition-all hover:border-gold hover:text-gold"
            >
              View on GitHub →
            </a>
          </div>
          <div className="border-t border-gold/20 bg-black/15 p-8 md:border-t-0 md:border-l md:p-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
              Workforce · run by the core team
            </p>
            <h3 className="mb-3 text-xl font-light text-ivory">Hire us to run it</h3>
            <p className="mb-7 text-sm leading-relaxed text-ivory/55">
              AI digital workers that execute your real business processes end-to-end on the
              systems you already run. Start with a priced Discovery audit.
            </p>
            <div className="mb-7 flex flex-col gap-3">
              {discoveryPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between rounded-lg border border-gold/15 px-4 py-3"
                >
                  <span className="text-sm text-ivory">{pkg.name}</span>
                  <span className="font-mono text-sm text-gold">{pkg.price}</span>
                </div>
              ))}
            </div>
            <a
              href={mailtoHref(discoveryPackages[0].mailSubject)}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-espresso transition-all hover:bg-gold-warm"
            >
              Book a Discovery call →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
