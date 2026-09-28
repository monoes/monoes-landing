import type { Metadata } from "next";
import Link from "next/link";
import { LibraryCard } from "@/components/library/LibraryCard";
import { getPageViewer, loadList } from "@/lib/library/page-data";
import { parseKind, type Kind } from "@/lib/library/types";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Workflows, web automations and agent orgs for MonoAgent: official packages from monoes and ones the community shares. Add any of them to your local MonoAgent in one command.";

export const metadata: Metadata = {
  title: "Library · monoes",
  description: DESCRIPTION,
  alternates: { canonical: "/library" },
  openGraph: { title: "Library · monoes", description: DESCRIPTION, type: "website" },
};

const TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "workflows", label: "Workflows" },
  { key: "automations", label: "Web automations" },
  { key: "orgs", label: "Orgs" },
  { key: "mine", label: "My library" },
];
const PER_PAGE = 24;

type Search = Promise<{ tab?: string; q?: string; page?: string }>;

function tabHref(tab: string, q: string, page = 1): string {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("tab", tab);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const s = params.toString();
  return s ? `/library?${s}` : "/library";
}

export default async function LibraryPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "all";
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const kind: Kind | null = tab === "mine" || tab === "all" ? null : parseKind(tab);
  const viewer = await getPageViewer();

  const mine = tab === "mine";
  const { items, total } =
    mine && !viewer
      ? { items: [], total: 0 }
      : await loadList({ kind, scope: mine ? "mine" : "public", q, tag: null, page, perPage: PER_PAGE }, viewer);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main className="bg-ivory-warm px-4 pt-24 pb-16 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-espresso">Library</h1>
            <p className="mt-2 max-w-2xl text-sm text-espresso/70">{DESCRIPTION}</p>
          </div>
          <Link
            href={viewer ? "/library/upload" : "/community/login"}
            className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-dark"
          >
            {viewer ? "Upload" : "Log in to upload"}
          </Link>
        </div>

        <nav aria-label="Library sections" className="mt-8 flex flex-wrap gap-1 border-b border-ivory-linen">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={tabHref(t.key, q)}
              aria-current={t.key === tab ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
                t.key === tab
                  ? "border-gold-dark font-medium text-espresso"
                  : "border-transparent text-espresso/60 hover:text-espresso"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <form action="/library" className="mt-6 flex gap-2" role="search">
          {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
          <label htmlFor="library-q" className="sr-only">
            Search the library
          </label>
          <input
            id="library-q"
            name="q"
            defaultValue={q}
            placeholder="Search by name or description"
            className="min-w-0 flex-1 rounded-md border border-ivory-linen bg-ivory px-3 py-2 text-sm text-espresso placeholder:text-espresso/40 focus:border-gold-dark focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md border border-espresso/20 px-4 py-2 text-sm text-espresso transition-colors hover:border-espresso/40"
          >
            Search
          </button>
        </form>

        {tab === "orgs" && (
          <p className="mt-4 text-sm text-espresso/65">
            Orgs from the{" "}
            <Link href="/community/orgs" className="text-gold-dark underline-offset-2 hover:underline">
              community org gallery
            </Link>{" "}
            are listed here too, with their role charts and run outputs on the gallery page.
          </p>
        )}

        {mine && !viewer ? (
          <p className="mt-10 text-sm text-espresso/70">
            <Link href="/community/login" className="text-gold-dark underline-offset-2 hover:underline">
              Log in
            </Link>{" "}
            to see your private and published items.
          </p>
        ) : items.length === 0 ? (
          <p className="mt-10 text-sm text-espresso/70">
            {q ? `Nothing matches “${q}”.` : mine ? "You haven't uploaded anything yet." : "Nothing here yet."}
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.id}>
                <LibraryCard item={item} />
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={tabHref(tab, q, page - 1)} className="text-gold-dark hover:underline">
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="text-espresso/55">
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <Link href={tabHref(tab, q, page + 1)} className="text-gold-dark hover:underline">
                Older →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
