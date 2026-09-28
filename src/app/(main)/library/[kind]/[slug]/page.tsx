import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { AddToMonoAgent } from "@/components/library/AddToMonoAgent";
import { VisibilityBadge } from "@/components/library/LibraryCard";
import { OwnerControls } from "@/components/library/OwnerControls";
import { getPageViewer, loadDetail } from "@/lib/library/page-data";
import { KIND_LABEL, KIND_PATH, parseKind, type LibraryItem } from "@/lib/library/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ kind: string; slug: string }>;

// Shared by generateMetadata and the page so the item loads once per request.
const getDetail = cache(async (kindSegment: string, slug: string) => {
  const kind = parseKind(kindSegment);
  // Only the plural URL segments are pages (/library/automations/x).
  if (!kind || KIND_PATH[kind] !== kindSegment) return null;
  return loadDetail(kind, slug, await getPageViewer());
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { kind, slug } = await params;
  const detail = await getDetail(kind, slug);
  if (!detail) return { title: "Not found · Library" };
  const { item } = detail;
  return {
    title: `${item.name} · ${KIND_LABEL[item.kind]} · monoes library`,
    description: item.description.slice(0, 200),
    alternates: { canonical: `/library/${KIND_PATH[item.kind]}/${item.slug}` },
    ...(item.visibility === "private" ? { robots: { index: false } } : {}),
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Chips({ values }: { values: string[] }) {
  if (values.length === 0) return <span className="text-espresso/50">none</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <code key={v} className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[12px] text-espresso/80">
          {v}
        </code>
      ))}
    </span>
  );
}

function MetaRows({ item }: { item: LibraryItem }) {
  const m = item.meta as Record<string, unknown>;
  const rows: [string, React.ReactNode][] = [];
  if (item.kind === "automation") {
    rows.push(["Sites", <Chips key="s" values={(m.site_domains as string[]) ?? []} />]);
    rows.push(["Actions", <Chips key="a" values={(m.actions as string[]) ?? []} />]);
    if (m.publisher) rows.push(["Publisher", String(m.publisher)]);
    rows.push(["Policy tier", String(m.policy_tier ?? "standard")]);
    if (m.requires_native) {
      // ">=0.0.0" (the pack default) says nothing, so it isn't shown.
      const engine =
        typeof m.engine === "string" && m.engine && !/^>=\s*0\.0\.0$/.test(m.engine) ? m.engine.replace(/^>=\s*/, "≥ ") : null;
      rows.push([
        "Needs",
        `MonoAgent${engine ? ` ${engine}` : ""} with the built-in ${String(m.native ?? "")} bot`.replace(/\s+/g, " "),
      ]);
    }
  } else if (item.kind === "workflow") {
    rows.push(["Triggers", <Chips key="t" values={(m.trigger_types as string[]) ?? []} />]);
    rows.push(["Node types", <Chips key="n" values={(m.node_types as string[]) ?? []} />]);
    rows.push(["Needs automations", <Chips key="r" values={(m.required_automations as string[]) ?? []} />]);
  } else {
    rows.push(["Roles", String(m.role_count ?? 0)]);
    if (m.topology) rows.push(["Topology", String(m.topology)]);
  }
  return (
    <dl className="mt-8 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-espresso/55">{label}</dt>
          <dd className="text-espresso">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function LibraryItemPage({ params }: { params: Params }) {
  const { kind, slug } = await params;
  const detail = await getDetail(kind, slug);
  if (!detail) notFound();
  const { item, versions } = detail;

  return (
    <main className="bg-ivory-warm px-4 pt-24 pb-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-espresso/60">
          <Link href="/library" className="hover:text-espresso">
            Library
          </Link>{" "}
          /{" "}
          <Link href={`/library?tab=${KIND_PATH[item.kind]}`} className="hover:text-espresso">
            {KIND_LABEL[item.kind]}s
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-espresso">{item.name}</h1>
          <VisibilityBadge visibility={item.visibility} />
        </div>
        <p className="mt-2 text-sm text-espresso/60">
          v{item.version} · by {item.owner.username ?? item.owner.name} · updated {new Date(item.updated_at).toLocaleDateString()}
          {item.tags.length > 0 && <> · {item.tags.map((t) => `#${t}`).join(" ")}</>}
        </p>
        {item.description && <p className="mt-5 whitespace-pre-line text-espresso/80">{item.description}</p>}

        <div className="mt-6 flex flex-wrap items-start gap-3">
          <AddToMonoAgent kind={item.kind} id={item.id} />
          <a
            href={item.artifact_url}
            className="rounded-md border border-espresso/20 px-4 py-2 text-sm text-espresso transition-colors hover:border-espresso/40"
          >
            Download
          </a>
          {detail.gallery && (
            <Link
              href={`/community/orgs/${item.slug}`}
              className="rounded-md border border-espresso/20 px-4 py-2 text-sm text-espresso transition-colors hover:border-espresso/40"
            >
              View in org gallery
            </Link>
          )}
        </div>

        <MetaRows item={item} />

        <section aria-labelledby="versions" className="mt-10">
          <h2 id="versions" className="text-base font-semibold text-espresso">
            Versions
          </h2>
          <ul className="mt-3 divide-y divide-ivory-linen rounded-lg border border-ivory-linen bg-ivory">
            {versions.map((v) => (
              <li key={v.version} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-medium text-espresso">
                  v{v.version}
                  {v.version === item.version && <span className="ml-2 text-xs font-normal text-gold-dark">current</span>}
                </span>
                <span className="text-espresso/55">
                  {new Date(v.created_at).toLocaleDateString()} · {formatSize(v.size)} ·{" "}
                  <code className="font-mono text-[12px]" title={v.sha256}>
                    {v.sha256.slice(0, 12)}
                  </code>{" "}
                  ·{" "}
                  <a href={v.artifact_url} className="text-gold-dark hover:underline">
                    download
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {(detail.canEdit || detail.canDelete) && (
          <OwnerControls item={item} canEdit={detail.canEdit} canDelete={detail.canDelete} isAdmin={detail.isAdmin} />
        )}
      </div>
    </main>
  );
}
