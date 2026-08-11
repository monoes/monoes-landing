import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security & Data Handling",
  description:
    "How Monoes Workforce handles client data: local-first storage, no cloud vector DB, BYOK encryption, human-in-the-loop on high-risk decisions, and full audit trails behind every worker action.",
  alternates: { canonical: "/security" },
};

const principles = [
  {
    title: "Local-first, no cloud vector DB",
    body: "Monomind stores memory and embeddings in local SQLite on infrastructure you control. We do not ship your data to a third-party vector database. Embeddings run locally.",
  },
  {
    title: "Bring your own keys (BYOK)",
    body: "All LLM calls are made with API keys you provide and own. We never proxy your prompts through a shared account. You can rotate or revoke keys at any time without our involvement.",
  },
  {
    title: "Human-in-the-loop on what matters",
    body: "Every worker runs inside a policy layer that defines what it can do autonomously and what requires approval. High-risk actions — like an invoice over a threshold you set — pause for a human decision before they execute. A reasoning model is never the thing that decides what's allowed.",
  },
  {
    title: "Full audit trail",
    body: "Every worker action — extraction, validation, decision, approval, ERP post — is logged with inputs, outputs, timestamps, and the policy version in effect. You can replay any decision after the fact.",
  },
  {
    title: "Connectors are bridges, not data stores",
    body: "The connectors to your ERP, CRM, and email are standard bridges that read and write through your existing APIs. They hold no data of their own and can be swapped without touching process logic. We never copy your system of record into ours.",
  },
  {
    title: "Versioned, testable policies",
    body: "The rules governing worker behavior — approval thresholds, vendor matching logic, exception routing — are versioned and auditable. You can see exactly which policy version governed any past action and roll back if needed.",
  },
];

export default function SecurityPage() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-24 md:py-32 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-dark mb-6 block">
        Security
      </span>
      <h1 className="text-4xl md:text-5xl font-semibold text-espresso tracking-tight mb-8 text-balance">
        How we handle your data and your decisions.
      </h1>
      <p className="text-lg text-gold-bronze leading-relaxed font-light mb-12">
        Workforce touches your ERP, CRM, and email — systems that hold the financial and personal
        data your business runs on. Here is exactly how that works, and the safeguards built in at
        the engine level.
      </p>

      <div className="space-y-8">
        {principles.map((p) => (
          <div key={p.title} className="border-l-2 border-gold/30 pl-6">
            <h2 className="text-xl font-semibold text-espresso mb-2">{p.title}</h2>
            <p className="text-gold-bronze leading-relaxed font-light">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-ivory-warm border border-ivory-linen p-8">
        <h2 className="text-xl font-semibold text-espresso mb-3">
          Want the technical detail?
        </h2>
        <p className="text-gold-bronze leading-relaxed font-light mb-4">
          The architecture behind every safeguard above is documented in full on the How It Works
          page, and the engine itself is open-source and auditable on GitHub.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/workforce/how-it-works"
            className="inline-block rounded-full border border-gold-dark px-5 py-2 text-sm font-semibold text-gold-dark hover:bg-gold-dark hover:text-white transition-colors"
          >
            Read the architecture →
          </Link>
          <a
            href="https://github.com/monoes/monomind"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-ivory-linen px-5 py-2 text-sm font-semibold text-gold-bronze hover:text-espresso transition-colors"
          >
            Audit the source ↗
          </a>
        </div>
      </div>

      <p className="mt-12 text-sm text-gold-muted">
        Questions about data residency, encryption, SSO, or sub-processors for a specific
        engagement?{" "}
        <a
          href="mailto:hello@monoes.me"
          className="text-gold-dark underline underline-offset-2 hover:text-espresso"
        >
          Ask us directly
        </a>
        .
      </p>
    </main>
  );
}
