import Link from "next/link";
import { OrgSimulation } from "@/components/demos/OrgSimulation";

export function HomeProofTeaser() {
  return (
    <section className="border-t border-gold/10 bg-espresso-deep px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Watch it coordinate</p>
        <h2 className="text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl">
          This is a real org, running.
        </h2>
      </div>
      <div className="mx-auto max-w-2xl">
        <OrgSimulation />
      </div>
      <div className="mt-8 text-center">
        <Link href="/projects/monomind" className="font-mono text-sm text-gold hover:underline">
          See scheduled orgs and the knowledge graph too → /projects/monomind
        </Link>
      </div>
    </section>
  );
}
