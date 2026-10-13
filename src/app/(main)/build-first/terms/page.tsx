import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Build First terms",
  description:
    "The conditions behind the Build First offer: Acceptance Spec, staging, review, Build Fee, pricing models, IP and data.",
  alternates: { canonical: "/build-first/terms" },
};

const link = "text-gold-dark underline underline-offset-2 hover:text-espresso";

export default function BuildFirstTermsPage() {
  return (
    <div className="bg-ivory">
    <main className="mx-auto max-w-3xl px-6 py-24 md:px-12 md:py-32">
      <h1 className="mb-3 text-4xl font-semibold tracking-tight text-espresso md:text-5xl">Build First terms</h1>
      <p className="mb-4 text-sm text-espresso/75">Effective: [date to be set on publication].</p>
      <p className="mb-12 leading-relaxed text-espresso/85">
        This page explains the conditions behind the Build First offer so nothing is hidden behind a headline. Each
        engagement is governed by a signed Evaluation Agreement and, if you proceed, a Conversion Agreement. Where they
        differ from this page, the signed agreements apply. The offer is made by Nokhodian UG (haftungsbeschränkt),
        c/o PANTOhealth GmbH, Bismarckstraße 10-12, 10625 Berlin, Germany [commercial register number to be added before publication].
      </p>

      <div className="space-y-12 leading-relaxed text-espresso/85">
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">What the offer is</h2>
          <p>
            No upfront payment. We build against a written Acceptance Spec that you sign before work starts, in a
            staging environment we control. You pay only if the build meets every requirement in the Spec. Equity deals
            are not free: equity is payment, and for those the offer reads &ldquo;we are paid only if the build meets
            your Acceptance Spec&rdquo;.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">Who can apply</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Companies: enough funds to pay the agreed price if the build succeeds, and a named person with signing authority.</li>
            <li>Startups paying in cash or cash plus equity: an incorporated entity and a founder who can sign.</li>
            <li>Equity-only startups: an incorporated entity (or a commitment to incorporate before conversion), a documented cap table, authority to issue equity, and our own assessment of the idea, its stage and the team.</li>
            <li>Individuals qualify on the same basis, once they can show they can pay or have an entity for an equity deal.</li>
          </ul>
          <p className="mt-4">
            We decide on every application and give a reason category if we decline. We do not accept regulated or
            safety-critical systems, hardware, or work that needs production credentials or production data before you sign.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">The Acceptance Spec</h2>
          <p>
            Each requirement is a row with exact test steps and an expected result. Only binary, testable rows are
            accepted. The Spec is signed by the person who decides and then frozen. Later changes are written change
            requests that we absorb, defer to the paid phase or decline, and they never extend the free build beyond
            its agreed scope. If you miss a dependency we need from you, the build clock pauses. If the pause continues
            for the period set in your agreement, the slot lapses and nothing is owed on either side.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">Build, staging and review</h2>
          <p>
            We build in staging. You receive named access. We do not export source code, hand over deploy keys, or touch
            production systems or production data before you sign. You review through your own internal sign-off,
            within the window set in your Spec. A row fails only if its test steps do not produce the expected result,
            and the failure is reported with the row ID and reproduction steps. Failed rows get one fix cycle. If you do
            not respond within the window and a reminder period, the evaluation closes as not accepted.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">If every row passes</h2>
          <p>
            You proceed on the terms agreed before the build. If you decline after every row has passed, a Build Fee
            applies. Its amount is stated in your Evaluation Agreement before any work begins, and it gives you a
            non-exclusive licence to what the fee covers. For equity-only deals the equivalent is also agreed in
            advance.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">If a row does not pass</h2>
          <p>
            You owe nothing. Staging is taken down, and we delete your materials and anything derived from them within
            the period set in your agreement. We may keep generic know-how and reusable components that contain none of
            your confidential information.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">How pricing works</h2>
          <p className="mb-3">The price is agreed in writing before the build starts. How it is calculated depends on the line.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Modernize:</strong> a fixed price banded by the measured size of the code (counted with a named tool, excluding vendored, generated and blank lines), capped by the price in your Spec.</li>
            <li><strong>Flow:</strong> a monthly fee per live automation. The subscription starts at go-live.</li>
            <li><strong>Launch:</strong> a fixed cash price, cash plus equity, or equity only. Equity terms depend on the stage and strength of the idea and the team, and are set in advance, with vesting and milestones where relevant.</li>
          </ul>
          <p className="mt-4">
            This is separate from <Link href="/workforce" className={link}>Monoes Workforce</Link>, which is a separate service that starts with a Discovery audit paid after delivery.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">Intellectual property</h2>
          <p>
            Until you sign the Conversion Agreement, Monoes keeps the built product. Modernize: your original code stays
            yours, we receive a limited licence to work on it, and derived code is licensed or assigned only after
            conversion. Flow: Monoes keeps the platform and automation IP and you keep your data and configuration.
            Launch: IP is assigned to you when you pay or the equity is issued. Your own brand and materials always stay yours.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">Confidentiality, data and who does the work</h2>
          <p>
            A mutual NDA applies from the first Spec call. We use synthetic or sample data in staging. The work is done
            by the Monoes team and vetted contributors who are bound by confidentiality and IP agreements, and Monoes
            reviews everything before you see it. Where personal data is involved we agree a data processing agreement.
            See the <Link href="/privacy" className={link}>privacy notice</Link> for how application data is handled.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">Capacity and the waitlist</h2>
          <p>
            We run a limited number of builds in parallel. When all slots are in use, new applications join a waitlist
            in the order they arrive, and we write to you when a slot opens.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-espresso">Law and contact</h2>
          <p>
            These terms and the agreements under them are governed by the laws of Germany. For business customers the place of jurisdiction is Berlin-Charlottenburg. Questions:{" "}
            <a href="mailto:hello@monoes.me" className={link}>hello@monoes.me</a>.
          </p>
        </section>
      </div>
    </main>
    </div>
  );
}
