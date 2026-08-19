import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";
import { isModerator } from "@/lib/community/is-moderator";

export function canDeleteOrgUpload(currentUser: { id: string; role?: string }, uploaderId: string): boolean {
  return currentUser.id === uploaderId || currentUser.role === "admin" || currentUser.role === "moderator";
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const sessionUser = session.user as { id: string; role?: string; blockedAt?: unknown };
  if (sessionUser.blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  const [existing] = await db
    .select({ id: orgUpload.id, uploaderId: orgUpload.uploaderId })
    .from(orgUpload)
    .where(eq(orgUpload.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Org upload not found" }, { status: 404 });
  }

  if (!canDeleteOrgUpload(sessionUser, existing.uploaderId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(orgUpload).where(eq(orgUpload.id, id));

  return NextResponse.json({ id });
}
