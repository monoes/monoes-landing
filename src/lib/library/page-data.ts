import { cache } from "react";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { canDelete, canEdit, canView, isAdmin, type Viewer } from "./access";
import type { ListQuery } from "./http";
import { GALLERY_ORG_VERSION } from "./serialize";
import { findItem, getArtifact, listItems, listVersions, serialize } from "./store";
import { listComments, voteSummaries, type CommentView } from "./community-store";
import type { Kind, LibraryItem, LibraryVersionInfo, Visibility } from "./types";

export type PageViewer = { id: string; username: string | null; role: string | null; blockedAt: unknown } | null;

// cache(): pages call it more than once per request (metadata, page body).
export const getPageViewer = cache(async (): Promise<PageViewer> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as { id: string; username?: string | null; role?: string | null; blockedAt?: unknown };
  return { id: u.id, username: u.username ?? null, role: u.role ?? null, blockedAt: u.blockedAt ?? null };
});

async function pageOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "monoes.me";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function loadList(query: ListQuery, viewer: PageViewer) {
  return listItems(getDb(), query, query.scope === "mine" ? (viewer?.id ?? null) : null, await pageOrigin());
}

export interface DetailData {
  item: LibraryItem;
  versions: LibraryVersionInfo[];
  gallery: boolean;
  /** Votes and comments; null for private items. */
  community: { apiBase: string; myVote: -1 | 0 | 1; comments: CommentView[]; canModerate: boolean } | null;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export async function loadDetail(kind: Kind, slug: string, viewer: PageViewer): Promise<DetailData | null> {
  const db = getDb();
  const found = await findItem(db, { kind, slug });
  if (!found) return null;
  const v: Viewer = viewer;
  const owned =
    found.source === "library"
      ? { ownerId: found.row.ownerId, visibility: found.row.visibility as Visibility }
      : { ownerId: found.row.uploaderId, visibility: "public" as const };
  if (!canView(owned, v)) return null;

  const origin = await pageOrigin();
  const [item] = await serialize(db, [found], origin);
  const base = `${origin}/api/library/items/${item.id}/artifact?version=`;
  let versions: LibraryVersionInfo[];
  if (found.source === "gallery") {
    const a = await getArtifact(db, found);
    versions = [{ version: GALLERY_ORG_VERSION, sha256: a!.sha256, size: a!.size, created_at: item.created_at, artifact_url: base + GALLERY_ORG_VERSION }];
  } else {
    versions = (await listVersions(db, found.row.id)).map((r) => ({
      version: r.version,
      sha256: r.sha256,
      size: r.size,
      created_at: r.createdAt.toISOString(),
      artifact_url: base + encodeURIComponent(r.version),
    }));
  }
  let community: DetailData["community"] = null;
  if (item.visibility !== "private") {
    const [votes, comments] = await Promise.all([
      voteSummaries(db, [{ id: item.id, source: found.source }], viewer?.id ?? null),
      listComments(db, item.id, found.source),
    ]);
    community = {
      // Gallery orgs keep their org vote/comment endpoints and tables.
      apiBase: found.source === "gallery" ? `/api/community/orgs/${item.id}` : `/api/community/library/${item.id}`,
      myVote: votes.get(item.id)?.myVote ?? 0,
      comments,
      canModerate: !viewer?.blockedAt && (viewer?.role === "admin" || viewer?.role === "moderator"),
    };
  }
  return {
    item,
    versions,
    community,
    gallery: found.source === "gallery",
    canEdit: found.source === "library" && canEdit(owned, v),
    canDelete: canDelete(owned, v),
    isAdmin: isAdmin(v),
  };
}

export type GalleryItem = LibraryItem & { myVote: -1 | 0 | 1 };

/** Public and official items of one kind, with the viewer's own votes, for /community/<kind> galleries. */
export async function loadGallery(
  kind: Kind,
  opts: { q: string; sort: "latest" | "popular"; page: number; perPage: number },
  viewer: PageViewer,
): Promise<{ items: GalleryItem[]; total: number }> {
  const db = getDb();
  const { items, total } = await listItems(
    db,
    { kind, scope: "public", q: opts.q, tag: null, page: opts.page, perPage: opts.perPage, sort: opts.sort },
    null,
    await pageOrigin(),
  );
  const mine = viewer
    ? await voteSummaries(db, items.map((i) => ({ id: i.id, source: "library" as const })), viewer.id)
    : new Map();
  return { items: items.map((i) => ({ ...i, myVote: mine.get(i.id)?.myVote ?? 0 })), total };
}
