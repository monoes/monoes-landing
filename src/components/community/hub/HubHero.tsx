import Image from "next/image";
import Link from "next/link";
import { Constellation, type ConstellationNode } from "./Constellation";
import styles from "./hub.module.css";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function HubHero({ nodes, signedIn }: { nodes: ConstellationNode[]; signedIn: boolean }) {
  return (
    <section aria-labelledby="community-title" className="relative isolate overflow-hidden bg-espresso-deep text-ivory">
      <Image
        src="/images/community/hero-network.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-right opacity-[0.16]"
      />
      <div aria-hidden="true" className={`${styles.grid} absolute inset-0 -z-10`} />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_20%_40%,rgb(26_18_8/0.92),transparent_70%)]"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:py-20">
        <div>
          <p className={`${styles.rise} font-mono text-xs tracking-[0.2em] text-gold`} style={delay(0)}>
            MONOES COMMUNITY
          </p>
          <h1
            id="community-title"
            className="mt-5 text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-balance"
          >
            <span className={`${styles.rise} block`} style={delay(80)}>
              Build agents together.
            </span>
            <span className={`${styles.rise} block text-gold`} style={delay(200)}>
              Share what works.
            </span>
          </h1>
          <p className={`${styles.rise} mt-6 max-w-[52ch] text-lg leading-relaxed text-ivory/80 text-pretty`} style={delay(320)}>
            Browse the orgs, workflows and web automations people run with MonoAgent. Install any of them in one command,
            vote for the best, and tell us what to build next.
          </p>
          <div className={`${styles.rise} mt-8 flex flex-wrap items-center gap-3`} style={delay(440)}>
            <Link
              href={signedIn ? "/library/upload" : "/community/register"}
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-espresso-deep transition-colors duration-200 hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {signedIn ? "Share your work" : "Join the community"}
            </Link>
            <Link
              href="/library"
              className="rounded-full border border-ivory/25 px-6 py-3 text-sm font-medium text-ivory transition-colors duration-200 hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Browse the library
            </Link>
            {!signedIn && (
              <Link href="/community/login" className="px-2 text-sm text-ivory/75 underline-offset-4 hover:text-ivory hover:underline">
                Sign in
              </Link>
            )}
          </div>
          <p
            className={`${styles.rise} mt-10 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-lg border border-gold/15 bg-black/30 px-4 py-2.5 font-mono text-[13px] text-ivory/85`}
            style={delay(560)}
          >
            <span aria-hidden="true" className="text-gold">
              $
            </span>
            <span className="truncate">monoagentcli library install automation instagram</span>
            <span aria-hidden="true" className={`${styles.cursor} inline-block h-4 w-2 bg-gold/80`} />
          </p>
        </div>

        <div>
          <Constellation nodes={nodes} />
          <ul className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ivory/75" aria-label="Legend">
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="-14 -14 28 28" aria-hidden="true">
                <polygon points="0,-12 10.4,-6 10.4,6 0,12 -10.4,6 -10.4,-6" fill="none" stroke="#C8A97E" strokeWidth="2.5" />
              </svg>
              Org
            </li>
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="-14 -14 28 28" aria-hidden="true">
                <circle r="10" fill="none" stroke="#B8956A" strokeWidth="2.5" />
                <circle r="3.5" fill="#B8956A" />
              </svg>
              Workflow
            </li>
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="-14 -14 28 28" aria-hidden="true">
                <rect x="-10" y="-10" width="20" height="20" rx="4" fill="none" stroke="#EDE5D8" strokeWidth="2.5" />
              </svg>
              Web automation
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
