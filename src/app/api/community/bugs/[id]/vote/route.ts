import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { bug, bugVote } from "@/lib/db/schema";

export function isValidVoteValue(value: unknown): value is 1 | -1 | 0 {
  return value === 1 || value === -1 || value === 0;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { value?: unknown } | null;
  if (!isValidVoteValue(body?.value)) {
    return NextResponse.json({ error: "value must be 1, -1, or 0" }, { status: 400 });
  }

  const db = getDb();
  const [existingBug] = await db.select({ id: bug.id }).from(bug).where(eq(bug.id, id)).limit(1);
  if (!existingBug) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }

  if (body.value === 0) {
    await db.delete(bugVote).where(and(eq(bugVote.bugId, id), eq(bugVote.userId, session.user.id)));
  } else {
    await db
      .insert(bugVote)
      .values({ id: crypto.randomUUID(), bugId: id, userId: session.user.id, value: body.value, createdAt: new Date() })
      .onConflictDoUpdate({ target: [bugVote.bugId, bugVote.userId], set: { value: body.value } });
  }

  const votes = await db.select({ value: bugVote.value }).from(bugVote).where(eq(bugVote.bugId, id));
  const score = votes.reduce((sum, v) => sum + v.value, 0);

  return NextResponse.json({ score, myVote: body.value });
}
