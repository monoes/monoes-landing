import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { canDelete, canEdit, canView, isAdmin, type Viewer } from "./access";
import type { ListQuery } from "./http";
import { GALLERY_ORG_VERSION } from "./serialize";
import { findItem, getArtifact, listItems, listVersions, serialize } from "./store";
import type { Kind, LibraryItem, LibraryVersionInfo, Visibility } from "./types";

export type PageViewer = { id: string; username: string | null; role: string | null; blockedAt: unknown } | null;

export async function getPageViewer(): Promise<PageViewer> {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as { id: string; username?: string | null; role?: string | null; blockedAt?: unknown };
  return { id: u.id, username: u.username ?? null, role: u.role ?? null, blockedAt: u.blockedAt ?? null };
}

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
  return {
    item,
    versions,
    gallery: found.source === "gallery",
    canEdit: found.source === "library" && canEdit(owned, v),
    canDelete: canDelete(owned, v),
    isAdmin: isAdmin(v),
  };
}
