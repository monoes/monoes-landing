import { discoveryPackages, discoveryContactEmail, discoveryEmailBody } from "@/lib/workforce";
import { RevealHeading } from "./RevealHeading";

function mailtoHref(subject: string) {
  return `mailto:${discoveryContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(discoveryEmailBody)}`;
}

export function HomePlans() {
  return (
    <section className="bg-ivory px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold-dark">Two ways in</p>
        <RevealHeading
          as="h2"
          className="mb-14 max-w-xl text-3xl font-light leading-tight tracking-tight text-espresso md:text-4xl"
        >
          Run it yourself, or have us run it for you.
        </RevealHeading>
        <div className="grid overflow-hidden rounded-2xl border border-espresso/12 md:grid-cols-2">
          <div className="bg-white p-8 md:p-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-dark">
              Self-hosted · free forever
            </p>
            <h3 className="mb-3 text-xl font-light text-espresso">Deploy it yourself</h3>
            <p className="mb-7 text-sm leading-relaxed text-espresso/55">
              Monomind (Apache-2.0) and Mono Agent (MIT). Full source. Install in minutes. No usage
              caps, no monthly billing, no vendor relationship.
            </p>
            <a
              href="https://github.com/monoes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-espresso/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-espresso/75 transition-all hover:border-gold-dark hover:text-gold-dark"
            >
              View on GitHub →
            </a>
          </div>
          <div className="border-t border-espresso/12 bg-ivory-warm p-8 md:border-t-0 md:border-l md:p-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-dark">
              Workforce · run by the core team
            </p>
            <h3 className="mb-3 text-xl font-light text-espresso">Hire us to run it</h3>
            <p className="mb-7 text-sm leading-relaxed text-espresso/55">
              AI digital workers that execute your real business processes end-to-end on the
              systems you already run. Start with a priced Discovery audit.
            </p>
            <div className="mb-7 flex flex-col gap-3">
              {discoveryPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between rounded-lg border border-espresso/12 bg-white px-4 py-3"
                >
                  <span className="text-sm text-espresso">{pkg.name}</span>
                  <span className="font-mono text-sm text-gold-dark">{pkg.price}</span>
                </div>
              ))}
            </div>
            <a
              href={mailtoHref(discoveryPackages[0].mailSubject)}
              className="inline-flex items-center gap-2 rounded-full bg-gold-dark px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-ivory transition-all hover:bg-[#6d5110]"
            >
              Book a Discovery call →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
