import { NextResponse } from "next/server";
import { isValidVoteValue } from "@/app/api/community/orgs/[id]/vote/route";
import { castVote } from "@/lib/library/community-store";
import { findVotableItem, itemNotFound, requireCommunityWriter } from "@/lib/library/community-routes";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireCommunityWriter(request);
  if (ctx instanceof NextResponse) return ctx;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { value?: unknown } | null;
  if (!isValidVoteValue(body?.value)) {
    return NextResponse.json({ error: "value must be 1, -1, or 0" }, { status: 400 });
  }
  if (!(await findVotableItem(ctx.db, id))) return itemNotFound();

  return NextResponse.json(await castVote(ctx.db, id, ctx.user.id, body.value));
}
