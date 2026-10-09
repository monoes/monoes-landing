import { NextResponse } from "next/server";
import { isValidCommentBody } from "@/app/api/community/orgs/[id]/comments/route";
import { addComment } from "@/lib/library/community-store";
import { findVotableItem, itemNotFound, requireCommunityWriter } from "@/lib/library/community-routes";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireCommunityWriter(request);
  if (ctx instanceof NextResponse) return ctx;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const commentBody = typeof body?.body === "string" ? body.body.trim() : "";
  if (!isValidCommentBody(commentBody)) {
    return NextResponse.json({ error: "Comment must be 1-1000 characters." }, { status: 400 });
  }
  if (!(await findVotableItem(ctx.db, id))) return itemNotFound();

  const comment = await addComment(ctx.db, id, ctx.user.id, commentBody);
  return NextResponse.json({ ...comment, itemId: id }, { status: 201 });
}
