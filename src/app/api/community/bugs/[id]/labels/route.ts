import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bug, bugLabel, bugLabelLink } from "@/lib/db/schema";

export function isValidLabelId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isModerator(session: { user: unknown } | null): boolean {
  const sessionUser = session?.user as { role?: string; blockedAt?: unknown } | undefined;
  const role = sessionUser?.role;
  return !!session && (role === "admin" || role === "moderator") && !sessionUser?.blockedAt;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { labelId?: unknown } | null;
  if (!isValidLabelId(body?.labelId)) {
    return NextResponse.json({ error: "labelId is required" }, { status: 400 });
  }
  const labelId = body.labelId;

  const db = getDb();
  const [existingBug] = await db.select({ id: bug.id }).from(bug).where(eq(bug.id, id)).limit(1);
  if (!existingBug) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  const [existingLabel] = await db.select({ id: bugLabel.id }).from(bugLabel).where(eq(bugLabel.id, labelId)).limit(1);
  if (!existingLabel) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 });
  }

  await db.insert(bugLabelLink).values({ bugId: id, labelId }).onConflictDoNothing();

  return NextResponse.json({ bugId: id, labelId });
}
