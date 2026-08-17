import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  const sessionUser = session?.user as { role?: string; blockedAt?: unknown } | undefined;
  const role = sessionUser?.role;
  if (!session || (role !== "admin" && role !== "moderator") || sessionUser?.blockedAt) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { blocked?: unknown } | null;
  if (typeof body?.blocked !== "boolean") {
    return NextResponse.json({ error: "Missing 'blocked' boolean" }, { status: 400 });
  }

  const db = getDb();
  const blockedAt = body.blocked ? new Date() : null;
  const updated = await db
    .update(user)
    .set({ blockedAt, blockedBy: body.blocked ? session.user.id : null, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning({ id: user.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ blockedAt: blockedAt ? blockedAt.toISOString() : null });
}
