import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgRun } from "@/lib/db/schema";
import { canDeleteOrgRun } from "@/lib/community/can-delete-org-run";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; runId: string }> },
) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const sessionUser = session.user as { id: string; role?: string; blockedAt?: unknown };
  if (sessionUser.blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const { id, runId } = await params;
  const db = getDb();
  const [existing] = await db
    .select({ id: orgRun.id, uploaderId: orgRun.uploaderId })
    .from(orgRun)
    .where(and(eq(orgRun.id, runId), eq(orgRun.orgUploadId, id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (!canDeleteOrgRun(sessionUser, existing.uploaderId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(orgRun).where(eq(orgRun.id, runId));

  return NextResponse.json({ id: runId });
}
