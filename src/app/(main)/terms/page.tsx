import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the monoes.me community platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-24 md:py-32 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-dark mb-6 block">Legal</span>
      <h1 className="text-4xl md:text-5xl font-semibold text-espresso tracking-tight mb-3">Terms of Service</h1>
      <p className="text-sm text-gold-bronze mb-12">Effective September 1, 2026.</p>

      <div className="space-y-12 text-gold-bronze leading-relaxed font-light">
        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">What this covers</h2>
          <p>
            These terms govern your use of monoes.me and its community platform: accounts, bug reports, feature
            requests, posts, blog comments, and org uploads. Workforce engagements are governed by a separate,
            signed statement of work — see{" "}
            <Link href="/legal" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              Legal
            </Link>{" "}
            for that and for the open-source license terms of the underlying tools.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Accounts</h2>
          <p>
            You can register with an email and password, or sign in with Google. You&apos;re responsible for your
            account and anything posted under it. One account per person — don&apos;t create accounts to evade a
            block or to manipulate votes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Acceptable use</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>No illegal content, harassment, spam, or impersonation.</li>
            <li>
              No malicious content in org uploads or run output files. Run output files you upload are served
              back with a restrictive Content-Security-Policy sandbox, but you&apos;re still responsible for what
              you upload.
            </li>
            <li>Don&apos;t attempt to abuse, scrape at volume, or disrupt the API or the site.</li>
            <li>Don&apos;t use the API or MCP tools to post content that would violate these terms if posted directly.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Your content</h2>
          <p>
            You own what you post. By posting it, you grant monoes.me a non-exclusive, worldwide, royalty-free
            license to host, display, and distribute it as part of the service — that&apos;s what makes a public
            community platform work. Org uploads, bug reports, feature requests, and posts are public by design;
            don&apos;t post anything you don&apos;t want public.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Moderation</h2>
          <p>
            Moderators and admins can remove content, attach labels, and block accounts that violate these terms.
            A blocked account loses write access to the API immediately and can&apos;t start new sessions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Third-party API access</h2>
          <p>
            You can authorize third-party apps or agents to act on your behalf via OAuth, scoped to exactly what
            you approve on the consent screen. You can revoke that access at any time by contacting us; a revoked
            or expired token stops working immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">No warranty</h2>
          <p>
            The community platform is provided &quot;as is,&quot; without warranty of any kind. User-submitted
            content (including org uploads and run outputs) isn&apos;t vetted for correctness or safety before
            publishing — use your own judgment before running anything you find here.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Termination</h2>
          <p>
            You can delete your account at any time by emailing us. We can suspend or terminate accounts that
            violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Changes</h2>
          <p>We&apos;ll update the effective date above if these terms change materially.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Contact</h2>
          <p>
            <a href="mailto:hello@monoes.me" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              hello@monoes.me
            </a>
            . See also our{" "}
            <Link href="/privacy" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
