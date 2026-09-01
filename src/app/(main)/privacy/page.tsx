import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What monoes.me collects, why, and how to get it deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-24 md:py-32 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-dark mb-6 block">Legal</span>
      <h1 className="text-4xl md:text-5xl font-semibold text-espresso tracking-tight mb-3">Privacy Policy</h1>
      <p className="text-sm text-gold-bronze mb-12">Effective September 1, 2026.</p>

      <div className="space-y-12 text-gold-bronze leading-relaxed font-light">
        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">What this covers</h2>
          <p>
            This policy covers monoes.me and the monoes.me community platform (accounts, bug reports, feature
            requests, posts, and org uploads). It does not cover the open-source tools themselves (Monomind, Mono
            Agent, MonoClip, MonoTask) when you self-host them — those run on your own machine and send us
            nothing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Information we collect</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-espresso">Account info.</strong> If you register with email and password:
              your email and a hashed (never plaintext) password. If you sign in with Google: your name, email
              address, and profile picture, as shared by Google.
            </li>
            <li>
              <strong className="text-espresso">Profile info you add.</strong> Username, tagline, job title,
              company, tags, social links, and avatar image — all optional, all editable, all visible on your
              public profile.
            </li>
            <li>
              <strong className="text-espresso">Content you submit.</strong> Bug reports, feature requests,
              forum posts, blog comments, and org uploads (agent-org definitions and their run output files) —
              all public by design, since this is a community platform.
            </li>
            <li>
              <strong className="text-espresso">Session and security data.</strong> A session cookie, plus the IP
              address and user agent tied to each login, kept for abuse prevention.
            </li>
            <li>
              <strong className="text-espresso">API / OAuth access.</strong> If you (or an agent/CLI tool acting
              on your behalf) authorize a third-party app to use the monoes.me API, we store that app&apos;s
              granted scopes and an access token — hashed at rest, never stored in plaintext.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">How we use it</h2>
          <p>
            To run your account (authentication, sessions, showing your content and profile), to send
            transactional email you asked for (password resets, headless-agent sign-in codes), and to keep the
            community usable (spam and abuse prevention, moderation). We don&apos;t sell your data, and we
            don&apos;t use it for advertising — there is no advertising on this site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Third parties we use</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-espresso">Google</strong> — if you choose &quot;Continue with Google&quot;
              to sign in. Google&apos;s own privacy policy governs what Google itself does with your data;
              we only receive the profile fields you consent to share.
            </li>
            <li>
              <strong className="text-espresso">Resend</strong> — sends transactional email (password resets,
              agent sign-in codes) on our behalf. Not used for marketing.
            </li>
            <li>
              <strong className="text-espresso">Cloudflare</strong> — hosts the site, database, and file storage
              (avatars, org uploads) on its global edge network. Your data may be processed in any Cloudflare
              region as a result.
            </li>
            <li>
              <strong className="text-espresso">Plausible Analytics</strong> — privacy-respecting, cookieless
              page-view analytics. No cross-site tracking, no personal identifiers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Cookies</h2>
          <p>
            One session cookie, used to keep you signed in. No third-party advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Deleting your data</h2>
          <p>
            Email{" "}
            <a href="mailto:hello@monoes.me" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              hello@monoes.me
            </a>{" "}
            to request account deletion. We&apos;ll remove your account and profile data; public content you
            posted (bug reports, posts, org uploads) may be retained with the author shown as
            &quot;deleted user&quot; to preserve the discussion for other community members, unless you ask us to
            remove specific items too.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Children&apos;s privacy</h2>
          <p>
            This service isn&apos;t directed at children under 13, and we don&apos;t knowingly collect data from
            them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Changes</h2>
          <p>We&apos;ll update the effective date above if this policy changes materially.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-espresso mb-4">Contact</h2>
          <p>
            <a href="mailto:hello@monoes.me" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              hello@monoes.me
            </a>
            . See also our{" "}
            <Link href="/terms" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              open-source licenses
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
