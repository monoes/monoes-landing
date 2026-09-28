import Image from "next/image";
import Link from "next/link";
import type { HubGallery } from "@/lib/community/hub-data";
import styles from "./hub.module.css";

const GALLERY = {
  orgs: {
    title: "Org gallery",
    href: "/community/orgs",
    noun: ["org", "orgs"],
    blurb: "Agent teams people run with Monomind: their roles, who reports to whom, and real run outputs.",
    image: "/images/community/gallery-orgs.webp",
    alt: "A control-room view of an orchestrator agent wired to execution, audit and tooling agents",
  },
  workflows: {
    title: "Workflow gallery",
    href: "/community/workflows",
    noun: ["workflow", "workflows"],
    blurb: "MonoAgent workflows, from trigger to finished job, ready to import and run on your machine.",
    image: "/images/community/gallery-workflows.webp",
    alt: "A laptop on a wooden desk showing a multi-agent workflow graph",
  },
  automations: {
    title: "Web automation gallery",
    href: "/community/automations",
    noun: ["web automation", "web automations"],
    blurb: "Packages that drive real sites from your own browser: Instagram, LinkedIn, X, Hacker News and more.",
    image: "/images/community/gallery-automations.webp",
    alt: "The Monoes monkey mascot typing on a laptop at a sunny desk",
  },
} as const;

function Panel({ gallery, wide }: { gallery: HubGallery; wide: boolean }) {
  const g = GALLERY[gallery.key];
  return (
    <article
      className={`${styles.panel} group relative flex flex-col overflow-hidden rounded-2xl border border-ivory-linen bg-ivory transition-shadow duration-300 hover:shadow-soft-lg ${
        wide ? "lg:col-span-2 lg:grid lg:grid-cols-[1.35fr_1fr]" : ""
      }`}
    >
      <div className={`relative overflow-hidden bg-espresso-deep ${wide ? "aspect-[16/9]" : "aspect-[16/8]"}`}>
        <Image
          src={g.image}
          alt={g.alt}
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className={`${styles.panelImage} object-cover`}
        />
        <span className="absolute left-4 top-4 rounded-full bg-espresso-deep/85 px-3 py-1 font-mono text-xs text-ivory">
          {gallery.count === null ? "Members only" : `${gallery.count} ${gallery.count === 1 ? g.noun[0] : g.noun[1]}`}
        </span>
      </div>
      <div className={`flex flex-col gap-3 p-6 ${wide ? "lg:justify-center lg:p-10" : ""}`}>
        <h3 className={`font-semibold tracking-tight text-espresso ${wide ? "text-2xl lg:text-3xl" : "text-xl"}`}>
          {/* The title link covers the whole panel; the "latest" links sit above it. */}
          <Link
            href={g.href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-gold-dark"
          >
            {g.title}
            <span aria-hidden="true" className={`${styles.arrow} ml-2 inline-block text-gold-dark`}>
              →
            </span>
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-espresso/75 text-pretty">{g.blurb}</p>
        {gallery.count === null && (
          <p className="text-sm font-medium text-gold-dark">Log in to browse and install.</p>
        )}
        {gallery.latest.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-2" aria-label={`Newest in the ${g.title.toLowerCase()}`}>
            {gallery.latest.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="relative z-10 block max-w-[16rem] truncate rounded-full border border-ivory-linen bg-ivory-warm px-3 py-1 text-xs text-espresso/80 transition-colors hover:border-gold-dark hover:text-espresso"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function GalleryPanels({ galleries }: { galleries: HubGallery[] }) {
  return (
    <section aria-labelledby="galleries-title" className="mx-auto max-w-6xl px-4 pt-16 sm:px-8 lg:pt-20">
      <div className="max-w-2xl">
        <h2 id="galleries-title" className="text-3xl font-semibold tracking-tight text-espresso text-balance sm:text-4xl">
          Three galleries. Everything installs.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-espresso/75 text-pretty">
          Official packages from monoes sit next to what the community shares. Vote up what works; every item has a
          one-line install for MonoAgent.
        </p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {galleries.map((g, i) => (
          <Panel key={g.key} gallery={g} wide={i === 0} />
        ))}
      </div>
    </section>
  );
}
