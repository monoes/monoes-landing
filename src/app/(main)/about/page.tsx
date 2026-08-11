import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Monoes",
  description:
    "Monoes builds open-source AI agent tooling and a paid Workforce service that automates business processes end-to-end. Founded by Morteza Nokhodian, the author of the Monomind orchestration engine.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-24 md:py-32 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-dark mb-6 block">
        About
      </span>
      <h1 className="text-4xl md:text-5xl font-semibold text-espresso tracking-tight mb-8 text-balance">
        One person, one engine, two ways in.
      </h1>

      <div className="space-y-6 text-gold-bronze leading-relaxed text-lg font-light">
        <p>
          Monoes is the company behind four open-source AI tools —{" "}
          <Link href="/projects/monomind" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
            Monomind
          </Link>
          ,{" "}
          <Link href="/projects/mono-agent" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
            Mono Agent
          </Link>
          ,{" "}
          <Link href="/projects/mono-clip" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
            MonoClip
          </Link>
          , and{" "}
          <Link href="/projects/monotask" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
            MonoTask
          </Link>
          {" "}— and a paid service line,{" "}
          <Link href="/workforce" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
            Monoes Workforce
          </Link>
          , that uses the same engine to run real business processes for companies that want the outcome without running the software themselves.
        </p>

        <h2 className="text-2xl font-semibold text-espresso mt-12 mb-4">Who is behind this</h2>
        <p>
          Monoes is founded and operated by{" "}
          <strong className="text-espresso">Morteza Nokhodian</strong>, the author of the Monomind
          orchestration engine (npm:{" "}
          <code className="font-mono text-sm text-gold-dark">@monoes/monomindcli</code>). Every
          line of the open-source codebase is public on{" "}
          <a
            href="https://github.com/monoes"
            className="text-gold-dark underline underline-offset-2 hover:text-espresso"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . When you hire Workforce, you work directly with the person who built the engine — no
          account-manager layer.
        </p>

        <h2 className="text-2xl font-semibold text-espresso mt-12 mb-4">The thesis</h2>
        <p>
          Most AI tools sell you a model and call it a worker. We don&apos;t think that&apos;s
          enough. Take a Workforce engagement that automates AP: a worker finishes the job, it
          reads the invoice, matches it to the PO, decides whether it needs approval, posts it to
          the client&apos;s ERP, and tells you what it did — with an audit trail behind every
          step. Building that requires an orchestration engine with a separate policy layer —
          tool and file scoping, budgets, an audit trail — and a human in the loop on the
          decisions that matter. Monomind is the orchestration engine underneath it.
        </p>

        <h2 className="text-2xl font-semibold text-espresso mt-12 mb-4">Two ways in</h2>
        <div className="grid gap-6 sm:grid-cols-2 not-prose my-8">
          <div className="rounded-2xl border border-ivory-linen bg-ivory-warm p-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-gold mb-3 block">
              For developers
            </span>
            <h3 className="text-lg font-semibold text-espresso mb-2">Self-host, free</h3>
            <p className="text-sm text-gold-bronze leading-relaxed">
              Install Monomind and the other tools in minutes. Apache-2.0 licensed, BYOK from
              zero, no usage caps, no vendor relationship.
            </p>
            <Link
              href="/projects/monomind"
              className="inline-block mt-4 text-sm font-semibold text-gold-dark hover:text-espresso"
            >
              View the projects →
            </Link>
          </div>
          <div className="rounded-2xl border border-ivory-linen bg-ivory-warm p-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-gold mb-3 block">
              For businesses
            </span>
            <h3 className="text-lg font-semibold text-espresso mb-2">Hire us to run it</h3>
            <p className="text-sm text-gold-bronze leading-relaxed">
              We deploy AI digital workers that execute your real business processes end-to-end on
              the systems you already run. Start with a priced Discovery audit.
            </p>
            <Link
              href="/workforce"
              className="inline-block mt-4 text-sm font-semibold text-gold-dark hover:text-espresso"
            >
              Explore Workforce →
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-espresso mt-12 mb-4">Get in touch</h2>
        <p>
          For Workforce inquiries:{" "}
          <a
            href="mailto:hello@monoes.me"
            className="text-gold-dark underline underline-offset-2 hover:text-espresso"
          >
            hello@monoes.me
          </a>
          . For open-source questions, use the{" "}
          <a
            href="https://github.com/monoes/monomind/discussions"
            className="text-gold-dark underline underline-offset-2 hover:text-espresso"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub discussions
          </a>
          .
        </p>
      </div>
    </main>
  );
}
