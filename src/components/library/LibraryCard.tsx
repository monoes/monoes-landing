import Link from "next/link";
import { KIND_LABEL, KIND_PATH, type LibraryItem } from "@/lib/library/types";

const DESCRIPTION_TRUNCATE = 160;

export function VisibilityBadge({ visibility }: { visibility: LibraryItem["visibility"] }) {
  if (visibility === "public") return null;
  const style =
    visibility === "official"
      ? "border-gold-dark/30 bg-gold/10 text-gold-dark"
      : "border-espresso/15 bg-ivory-parchment text-espresso/65";
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${style}`}>
      {visibility}
    </span>
  );
}

function summary(item: LibraryItem): string {
  const m = item.meta as Record<string, unknown>;
  if (item.kind === "automation") {
    const domains = (m.site_domains as string[] | undefined) ?? [];
    const actions = (m.actions as string[] | undefined) ?? [];
    return [domains[0], `${actions.length} action${actions.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ");
  }
  if (item.kind === "workflow") {
    const nodes = (m.node_types as string[] | undefined) ?? [];
    return `${nodes.length} node type${nodes.length === 1 ? "" : "s"}`;
  }
  const roles = Number(m.role_count ?? 0);
  return [`${roles} role${roles === 1 ? "" : "s"}`, m.topology as string | null].filter(Boolean).join(" · ");
}

export function LibraryCard({ item }: { item: LibraryItem }) {
  const description =
    item.description.length > DESCRIPTION_TRUNCATE ? `${item.description.slice(0, DESCRIPTION_TRUNCATE)}…` : item.description;
  return (
    <Link
      href={`/library/${KIND_PATH[item.kind]}/${item.slug}`}
      className="block rounded-lg border border-ivory-linen bg-ivory p-5 transition-colors hover:border-espresso/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-dark"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-espresso">{item.name}</p>
        <VisibilityBadge visibility={item.visibility} />
      </div>
      {description && <p className="mt-1 text-sm text-espresso/70">{description}</p>}
      <p className="mt-2 text-xs text-espresso/55">
        {KIND_LABEL[item.kind]} · v{item.version} · {summary(item)} · {item.owner.username ?? item.owner.name}
      </p>
    </Link>
  );
}
