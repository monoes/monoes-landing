import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Monoes terms of service, privacy policy, and open-source license attribution. Monomind is Apache-2.0 licensed.",
  alternates: { canonical: "/legal" },
};

export default function LegalPage() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-24 md:py-32 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-dark mb-6 block">
        Legal
      </span>
      <h1 className="text-4xl md:text-5xl font-semibold text-espresso tracking-tight mb-12">
        Terms &amp; licenses
      </h1>

      <div className="space-y-12 text-gold-bronze leading-relaxed font-light">
        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Open-source license</h2>
          <p className="mb-4">
            The Monomind orchestration engine and its packages are licensed under{" "}
            <strong className="text-espresso">Apache-2.0</strong>. The full license text is in the{" "}
            <a
              href="https://github.com/monoes/monomind/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2 hover:text-espresso"
            >
              repository
            </a>
            . You are free to use, modify, and distribute the software, including commercially,
            under the terms of that license.
          </p>
          <p>
            MonoClip and MonoTask carry their own licenses in their respective repositories. Check
            each project&apos;s <code className="font-mono text-sm text-gold-dark">LICENSE</code>{" "}
            file for the authoritative text.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">
            Workforce engagement terms
          </h2>
          <p className="mb-4">
            Monoes Workforce engagements (Discovery audits, pilots, and rollouts) are governed by a
            signed statement of work specific to each engagement. The terms below are a summary and
            the signed SOW controls in case of any conflict.
          </p>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-espresso">Discovery audits</strong> are fixed-price ($3,000
              for 1-Day, $12,000 for 5-Day) with defined deliverables. Payment is due on booking.
            </li>
            <li>
              <strong className="text-espresso">Pilot and rollout pricing</strong> is quoted as a
              fixed, itemized amount in your Discovery report. No open-ended billing.
            </li>
            <li>
              <strong className="text-espresso">IP ownership</strong>: you own any process
              definitions, policy configurations, and worker configurations created for your
              engagement. The underlying Monomind engine remains Apache-2.0.
            </li>
            <li>
              <strong className="text-espresso">Termination</strong>: either party may terminate
              with written notice. You retain all configurations and data; we delete or return
              yours within 30 days of termination.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Privacy</h2>
          <p>
            This website does not collect personal data beyond standard server logs and any
            analytics you can see in our page source (currently privacy-respecting, cookieless
            analytics only). We do not sell or share data with third parties. The open-source tools
            are self-hosted and phone nothing home - your usage data stays on your machine.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Contact</h2>
          <p>
            For legal or contracting questions:{" "}
            <a
              href="mailto:hello@monoes.me"
              className="text-gold-dark underline underline-offset-2 hover:text-espresso"
            >
              hello@monoes.me
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
