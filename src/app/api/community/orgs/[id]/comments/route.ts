import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { orgUpload, orgComment, user } from "@/lib/db/schema";

export function isValidCommentBody(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 1000;
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
  const body = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const commentBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!isValidCommentBody(commentBody)) {
    return NextResponse.json({ error: "Comment must be 1-1000 characters." }, { status: 400 });
  }

  const db = getDb();
  const [existingOrg] = await db.select({ id: orgUpload.id }).from(orgUpload).where(eq(orgUpload.id, id)).limit(1);
  if (!existingOrg) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  const now = new Date();
  const commentId = crypto.randomUUID();
  await db.insert(orgComment).values({
    id: commentId,
    orgUploadId: id,
    authorId: session.user.id,
    body: commentBody,
    createdAt: now,
  });

  const [author] = await db.select({ username: user.username }).from(user).where(eq(user.id, session.user.id)).limit(1);

  return NextResponse.json(
    {
      id: commentId,
      orgUploadId: id,
      authorId: session.user.id,
      authorUsername: author?.username ?? null,
      body: commentBody,
      createdAt: now.toISOString(),
    },
    { status: 201 },
  );
}
