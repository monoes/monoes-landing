import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bugLabelLink } from "@/lib/db/schema";
import { isModerator } from "@/lib/community/is-moderator";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; labelId: string }> },
) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, labelId } = await params;
  const db = getDb();
  const deleted = await db
    .delete(bugLabelLink)
    .where(and(eq(bugLabelLink.bugId, id), eq(bugLabelLink.labelId, labelId)))
    .returning({ bugId: bugLabelLink.bugId });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Label not attached to this bug" }, { status: 404 });
  }

  return NextResponse.json({ bugId: id, labelId });
}
