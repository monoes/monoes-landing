import type { Metadata } from "next";
import { PRODUCTS, getReleases } from "@/lib/releases";
import { ReleaseEntry } from "@/components/changelog/ReleaseEntry";

// Releases are fetched from GitHub once, at build time.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Release notes for Monomind, Mono Agent, MonoClip and MonoTask, pulled from GitHub Releases on every build.",
  alternates: { canonical: "/changelog" },
};

export default async function ChangelogPage() {
  const products = await Promise.all(
    PRODUCTS.map(async (product) => ({ ...product, releases: await getReleases(product.repo) })),
  );

  return (
    <main className="min-h-screen bg-ivory pt-24 pb-24">
      <div className="mx-auto max-w-3xl space-y-12 px-4 sm:px-8">
        <header className="space-y-4 border-b border-ivory-linen pb-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-espresso sm:text-4xl lg:text-5xl">
            Changelog
          </h1>
          <p className="text-lg leading-relaxed text-gold-bronze">
            Release notes for every Monoes open-source product, straight from GitHub Releases.
          </p>
          <nav aria-label="Products" className="flex flex-wrap gap-2 pt-2">
            {products.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="rounded-full border border-gold/30 bg-ivory-parchment px-3 py-1 text-sm font-medium text-espresso transition-colors hover:border-gold hover:text-gold-dark"
              >
                {p.name}
                {p.releases?.[0] && (
                  <span className="ml-1.5 font-mono text-xs text-gold-bronze">v{p.releases[0].version}</span>
                )}
              </a>
            ))}
          </nav>
        </header>

        {products.map((p) => {
          const releasesUrl = `https://github.com/${p.repo}/releases`;
          return (
            <section key={p.id} id={p.id} className="scroll-mt-24 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-espresso sm:text-3xl">{p.name}</h2>
                <a
                  href={releasesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-gold-dark underline underline-offset-2 hover:text-espresso"
                >
                  {p.repo}
                </a>
              </div>
              {p.releases === null ? (
                <p className="rounded-xl border border-gold/20 bg-ivory-parchment p-5 text-sm text-espresso/80">
                  Couldn&apos;t load releases —{" "}
                  <a href={releasesUrl} target="_blank" rel="noopener noreferrer" className="text-gold-dark underline underline-offset-2">
                    see them on GitHub
                  </a>
                  .
                </p>
              ) : p.releases.length === 0 ? (
                <p className="text-sm text-espresso/70">No releases published yet.</p>
              ) : (
                p.releases.map((release) => <ReleaseEntry key={release.tag} release={release} />)
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
