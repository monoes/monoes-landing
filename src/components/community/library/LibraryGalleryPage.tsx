import Link from "next/link";
import { LibraryGallery } from "./LibraryGallery";
import { getPageViewer, loadGallery } from "@/lib/library/page-data";
import { KIND_PATH } from "@/lib/library/types";

const PER_PAGE = 30;

export type GallerySearch = Promise<{ q?: string; sort?: string; page?: string }>;

const COPY = {
  workflow: {
    title: "Workflow gallery",
    empty: "No public workflows yet.",
    noun: "workflow",
    blurb: "MonoAgent workflows shared by monoes and the community. Add any of them to your MonoAgent in one command.",
  },
  automation: {
    title: "Web automation gallery",
    empty: "No public web automations yet.",
    noun: "web automation",
    blurb: "Web automations (.mpkg packages) that MonoAgent runs in your browser: official ones from monoes and ones the community shares.",
  },
} as const;

export const GALLERY_COPY = COPY;

function href(base: string, q: string, sort: string, page = 1): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (sort !== "latest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const s = params.toString();
  return s ? `${base}?${s}` : base;
}

/** /community/workflows and /community/automations. */
export async function LibraryGalleryPage({ kind, searchParams }: { kind: "workflow" | "automation"; searchParams: GallerySearch }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const sort = sp.sort === "popular" ? "popular" : "latest";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const viewer = await getPageViewer();
  const { items, total } = await loadGallery(kind, { q, sort, page, perPage: PER_PAGE }, viewer);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const base = `/community/${KIND_PATH[kind]}`;
  const copy = COPY[kind];
  const uploadHref = viewer ? `/library/upload?kind=${kind}&visibility=public` : "/community/login";
  const pillClass = (active: boolean) =>
    `rounded-md px-3 py-1 text-xs font-medium transition-colors ${
      active ? "bg-espresso text-ivory" : "border border-espresso/20 text-espresso hover:border-espresso/40"
    }`;

  return (
    <main className="bg-ivory-warm px-4 pt-24 pb-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-espresso tracking-tight">{copy.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-espresso/70">{copy.blurb}</p>
          </div>
          <Link
            href={uploadHref}
            className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80"
          >
            {viewer ? `Share a ${copy.noun}` : "Log in to share"}
          </Link>
        </div>

        <form action={base} role="search" className="mb-4 flex gap-2">
          {sort !== "latest" && <input type="hidden" name="sort" value={sort} />}
          <label htmlFor="gallery-q" className="sr-only">
            Search the {copy.title.toLowerCase()}
          </label>
          <input
            id="gallery-q"
            name="q"
            defaultValue={q}
            placeholder="Search by name or description"
            className="min-w-0 flex-1 rounded-md border border-ivory-linen bg-ivory px-3 py-2 text-sm text-espresso placeholder:text-espresso/40 focus:border-gold-dark focus:outline-none"
          />
          <button type="submit" className="rounded-md border border-espresso/20 px-4 py-2 text-sm text-espresso transition-colors hover:border-espresso/40">
            Search
          </button>
        </form>

        <nav aria-label="Sort" className="mb-6 flex gap-2">
          <Link href={href(base, q, "latest")} aria-current={sort === "latest" ? "page" : undefined} className={pillClass(sort === "latest")}>
            Latest
          </Link>
          <Link href={href(base, q, "popular")} aria-current={sort === "popular" ? "page" : undefined} className={pillClass(sort === "popular")}>
            Popular
          </Link>
        </nav>

        {items.length === 0 ? (
          <p className="text-sm text-espresso/70">{q ? `Nothing matches “${q}”.` : copy.empty}</p>
        ) : (
          <LibraryGallery key={`${sort}-${q}-${page}`} initialItems={items} loggedIn={!!viewer} />
        )}

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={href(base, q, sort, page - 1)} className="text-gold-dark hover:underline">← Previous</Link> : <span />}
            <span className="text-espresso/55">
              Page {page} of {pages}
            </span>
            {page < pages ? <Link href={href(base, q, sort, page + 1)} className="text-gold-dark hover:underline">Next →</Link> : <span />}
          </nav>
        )}

        <p className="mt-10 text-sm text-espresso/60">
          Also in the community:{" "}
          <Link href="/community/orgs" className="text-gold-dark hover:underline">Org gallery</Link>
          {kind === "workflow" ? (
            <> · <Link href="/community/automations" className="text-gold-dark hover:underline">Web automation gallery</Link></>
          ) : (
            <> · <Link href="/community/workflows" className="text-gold-dark hover:underline">Workflow gallery</Link></>
          )}
          {" "}· the whole <Link href="/library" className="text-gold-dark hover:underline">library</Link>.
        </p>
      </div>
    </main>
  );
}
