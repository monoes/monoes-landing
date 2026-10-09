import { NextResponse } from "next/server";
import { getAuthenticatedUser, type AuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb, type Db } from "@/lib/db";
import { findItem } from "./store";

// Shared by the /api/community/library/{id}/vote and /comments routes. They
// follow the /api/community/orgs/{id}/* conventions: community:write, string
// errors, 404 for anything that isn't a public or official library item.

export type CommunityContext = { user: AuthenticatedUser; db: Db };

export async function requireCommunityWriter(request: Request): Promise<CommunityContext | NextResponse> {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (session.user.blockedAt) return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  return { user: session.user, db: getDb() };
}

/** A public or official library item (not a gallery org: those use the org routes). */
export async function findVotableItem(db: Db, id: string) {
  const found = await findItem(db, { id });
  if (!found || found.source !== "library" || found.row.visibility === "private") return null;
  return found.row;
}

export function itemNotFound() {
  return NextResponse.json({ error: "Library item not found" }, { status: 404 });
}
