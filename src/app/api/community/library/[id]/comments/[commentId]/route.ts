import { NextResponse } from "next/server";
import { canDeleteComment } from "@/app/api/community/orgs/[id]/comments/[commentId]/route";
import { deleteComment, findComment } from "@/lib/library/community-store";
import { requireCommunityWriter } from "@/lib/library/community-routes";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  const ctx = await requireCommunityWriter(request);
  if (ctx instanceof NextResponse) return ctx;

  const { id, commentId } = await params;
  const comment = await findComment(ctx.db, id, commentId);
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  if (!canDeleteComment(ctx.user, comment.authorId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await deleteComment(ctx.db, commentId);
  return NextResponse.json({ id: commentId });
}
