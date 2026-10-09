import { capabilityCatalog, discoveryPackages, foundingClientProgram } from "@/lib/workforce";
import { RevealHeading } from "./RevealHeading";

const NOT_YET = [
  "Zero workers running at a paying client. The Founding Client Program exists because of this, not despite it.",
  "No interactive demo — paste a document, watch it move through the process. Planned, not built.",
  "No self-serve signup for Workforce. Every engagement starts with a human-run Discovery audit.",
  "Gossip and CRDT consensus strategies in Monomind are designed, not implemented.",
];

export function HomeTransparency() {
  const real = [
    {
      label: "GitHub stars",
      detail: "Pulled live on this page, every load — not a screenshot. Check the number above against github.com/monoes yourself.",
    },
    {
      label: "License",
      detail: "Apache-2.0 for Monomind, MIT for Mono Agent. Verifiable on each repo, not a claim on this page.",
    },
    {
      label: "The capability catalog",
      detail: `${capabilityCatalog.length} departments, every worker named individually on /workforce/capabilities. Count them.`,
    },
    {
      label: "Discovery pricing",
      detail: `${discoveryPackages[0].price} for ${discoveryPackages[0].duration}, ${discoveryPackages[1].price} for ${discoveryPackages[1].duration}. The only numbers on this site that are fixed in advance.`,
    },
  ];

  return (
    <section className="bg-espresso-deep px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Transparency</p>
        <RevealHeading
          as="h2"
          className="mb-14 max-w-2xl text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl"
        >
          Nothing here is fake. Some of it just isn&apos;t built yet.
        </RevealHeading>

        <div className="mb-12 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-gold">What&apos;s real</h3>
            <ul className="flex flex-col gap-5">
              {real.map((item) => (
                <li key={item.label}>
                  <p className="mb-1 text-sm font-medium text-ivory">{item.label}</p>
                  <p className="text-sm leading-relaxed text-ivory/50">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-ivory/40">Not yet built</h3>
            <ul className="flex flex-col gap-5">
              {NOT_YET.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-ivory/50">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-gold/20 bg-black/15 p-6">
          <p className="text-sm leading-relaxed text-ivory/70">
            We could have invented a testimonial. Instead: the first {foundingClientProgram.slotsTotal}{" "}
            clients get {foundingClientProgram.discountPercent}% off implementation, in exchange for
            being the named, on-the-record case study once their first worker goes live. That&apos;s
            the trade, agreed before anyone signs anything — not a quote pulled from nowhere.
          </p>
        </div>
      </div>
    </section>
  );
}
