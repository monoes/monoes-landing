import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { blogComment } from "@/lib/db/schema";

export function canDeleteComment(
  currentUser: { id: string; role?: string },
  commentAuthorId: string,
): boolean {
  return currentUser.id === commentAuthorId || currentUser.role === "admin" || currentUser.role === "moderator";
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; commentId: string }> },
) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const sessionUser = session.user as { id: string; role?: string; blockedAt?: unknown };
  if (sessionUser.blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const { slug, commentId } = await params;
  const db = getDb();
  const [existingComment] = await db
    .select({ id: blogComment.id, authorId: blogComment.authorId })
    .from(blogComment)
    .where(and(eq(blogComment.id, commentId), eq(blogComment.postSlug, slug)))
    .limit(1);

  if (!existingComment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (!canDeleteComment(sessionUser, existingComment.authorId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(blogComment).where(eq(blogComment.id, commentId));

  return NextResponse.json({ id: commentId });
}
