import Image from "next/image";
import Link from "next/link";

function Row({ href, label, open, hint }: { href: string; label: string; open: number; hint: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ivory-warm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-dark"
      >
        <span>
          <span className="block text-sm font-medium text-espresso">{label}</span>
          <span className="block text-xs text-espresso/65">{hint}</span>
        </span>
        <span className="shrink-0 rounded-full bg-espresso px-2.5 py-0.5 font-mono text-xs text-ivory">{open} open</span>
      </Link>
    </li>
  );
}

/** Sidebar next to the feed: the roadmap entry points and the install command. */
export function HubAside({ openFeatures, openBugs }: { openFeatures: number; openBugs: number }) {
  return (
    <aside className="order-first space-y-5 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0 lg:order-none lg:sticky lg:top-[140px] lg:block lg:space-y-5 lg:self-start" aria-label="Get involved">
      <section aria-labelledby="roadmap-title" className="overflow-hidden rounded-2xl border border-ivory-linen bg-ivory">
        <Image
          src="/images/community/roadmap.webp"
          alt="The Monoes monkey holding a clipboard, giving a thumbs up"
          width={640}
          height={349}
          className="h-40 w-full object-cover object-[center_30%]"
        />
        <div className="p-3 pt-4">
          <h2 id="roadmap-title" className="px-3 text-lg font-semibold tracking-tight text-espresso">
            Shape what we build next
          </h2>
          <ul className="mt-2">
            <Row href="/community/features" label="Feature requests" open={openFeatures} hint="Ask for it, or vote it up" />
            <Row href="/community/bugs" label="Bug reports" open={openBugs} hint="Tell us what broke" />
          </ul>
        </div>
      </section>

      <section aria-labelledby="install-title" className="rounded-2xl bg-espresso-deep p-5 text-ivory">
        <h2 id="install-title" className="text-base font-semibold">
          Everything installs in one line
        </h2>
        <p className="mt-1 text-sm text-ivory/75">Pick anything in a gallery, then run:</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black/35 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-ivory/90">
          <span className="text-gold">$</span> monoagentcli library install{"\n"}  workflow find-jobs-all-sources
        </pre>
        <Link href="/library" className="mt-4 inline-block text-sm font-medium text-gold underline-offset-4 hover:underline">
          Open the library →
        </Link>
      </section>
    </aside>
  );
}
