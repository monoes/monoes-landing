import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { post, postVote } from "@/lib/db/schema";

export function isValidVoteValue(value: unknown): value is 1 | -1 | 0 {
  return value === 1 || value === -1 || value === 0;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
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
  const [existingPost] = await db.select({ id: post.id }).from(post).where(eq(post.id, id)).limit(1);
  if (!existingPost) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (body.value === 0) {
    await db.delete(postVote).where(and(eq(postVote.postId, id), eq(postVote.userId, session.user.id)));
  } else {
    await db
      .insert(postVote)
      .values({ id: crypto.randomUUID(), postId: id, userId: session.user.id, value: body.value, createdAt: new Date() })
      .onConflictDoUpdate({ target: [postVote.postId, postVote.userId], set: { value: body.value } });
  }

  const votes = await db.select({ value: postVote.value }).from(postVote).where(eq(postVote.postId, id));
  const score = votes.reduce((sum, v) => sum + v.value, 0);

  return NextResponse.json({ score, myVote: body.value });
}
