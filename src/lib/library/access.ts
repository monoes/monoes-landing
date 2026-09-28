import type { Visibility } from "./types.ts";

export type Viewer = { id: string; role?: string | null; blockedAt?: unknown } | null;
type Owned = { ownerId: string; visibility: Visibility };

export function isAdmin(viewer: Viewer): boolean {
  return viewer?.role === "admin" && !viewer.blockedAt;
}

/** Private items are visible to their owner only; public and official ones to everyone. */
export function canView(item: Owned, viewer: Viewer): boolean {
  return item.visibility !== "private" || viewer?.id === item.ownerId;
}

/** Owner edits their item; admins also manage official items. */
export function canEdit(item: Owned, viewer: Viewer): boolean {
  if (!viewer || viewer.blockedAt) return false;
  return viewer.id === item.ownerId || (item.visibility === "official" && isAdmin(viewer));
}

export function canDelete(item: Owned, viewer: Viewer): boolean {
  if (!viewer || viewer.blockedAt) return false;
  return viewer.id === item.ownerId || isAdmin(viewer);
}

/** Only admins publish (or keep) official items. */
export function canSetVisibility(visibility: Visibility, viewer: Viewer): boolean {
  return visibility !== "official" || isAdmin(viewer);
}
