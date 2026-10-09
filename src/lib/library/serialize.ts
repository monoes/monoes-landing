import { KIND_PATH, type ItemOwner, type Kind, type LibraryItem, type Visibility } from "./types.ts";

/** A library_item row, as the store reads it. */
export interface ItemRow {
  id: string;
  kind: string;
  slug: string;
  name: string;
  description: string;
  visibility: string;
  tagsJson: string;
  ownerId: string;
  version: string;
  sha256: string;
  size: number;
  metaJson: string;
  createdAt: Date;
  updatedAt: Date;
}

/** An org_upload (gallery) row, exposed as a public kind=org item. */
export interface GalleryOrgRow {
  id: string;
  slug: string | null;
  name: string;
  goal: string;
  tagline: string | null;
  description: string | null;
  topology: string | null;
  roleCount: number;
  orgJson: string;
  uploaderId: string;
  createdAt: Date;
}

/** Gallery orgs have no version history; they are always this version. */
export const GALLERY_ORG_VERSION = "1.0.0";

function parseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function itemUrls(origin: string, kind: Kind, slug: string, id: string) {
  return {
    url: `${origin}/library/${KIND_PATH[kind]}/${slug}`,
    artifact_url: `${origin}/api/library/items/${id}/artifact`,
  };
}

function unknownOwner(id: string): ItemOwner {
  return { id, username: null, name: "Unknown" };
}

export function toApiItem(row: ItemRow, owner: ItemOwner | undefined, origin: string, score = 0): LibraryItem {
  const kind = row.kind as Kind;
  return {
    id: row.id,
    kind,
    slug: row.slug,
    name: row.name,
    description: row.description,
    version: row.version,
    visibility: row.visibility as Visibility,
    tags: parseJson<string[]>(row.tagsJson, []),
    owner: owner ?? unknownOwner(row.ownerId),
    sha256: row.sha256,
    size: row.size,
    meta: parseJson<Record<string, unknown>>(row.metaJson, {}),
    score,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    ...itemUrls(origin, kind, row.slug, row.id),
  };
}

export function galleryOrgToApiItem(
  row: GalleryOrgRow,
  owner: ItemOwner | undefined,
  artifact: { sha256: string; size: number },
  origin: string,
  score = 0,
): LibraryItem {
  const slug = row.slug ?? row.id;
  return {
    id: row.id,
    kind: "org",
    slug,
    name: row.name,
    description: row.tagline || row.description || row.goal,
    version: GALLERY_ORG_VERSION,
    visibility: "public",
    tags: [],
    owner: owner ?? unknownOwner(row.uploaderId),
    sha256: artifact.sha256,
    size: artifact.size,
    meta: { role_count: row.roleCount, topology: row.topology, gallery: true },
    score,
    created_at: row.createdAt.toISOString(),
    updated_at: row.createdAt.toISOString(),
    ...itemUrls(origin, "org", slug, row.id),
  };
}

/**
 * The ref for `monoagentcli library install <kind> <ref>`: the slug when it
 * is public and stable, else the id. Private items use the id, and so do
 * slugs that got a collision suffix ("-2"): for an automation, a slug other
 * than its automation id; for other kinds, a slug ending in "-<digits>".
 */
export function installRef(item: Pick<LibraryItem, "id" | "kind" | "slug" | "visibility" | "meta">): string {
  if (item.visibility === "private") return item.id;
  if (item.kind === "automation") return item.slug === item.meta.automation_id ? item.slug : item.id;
  return /-\d+$/.test(item.slug) ? item.id : item.slug;
}

/** Highest score first, then newest. */
export function byScoreDesc(a: LibraryItem, b: LibraryItem): number {
  return b.score - a.score || byUpdatedDesc(a, b);
}

/** Newest first, then by id so pages are stable. */
export function byUpdatedDesc(a: LibraryItem, b: LibraryItem): number {
  if (a.updated_at !== b.updated_at) return a.updated_at < b.updated_at ? 1 : -1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
