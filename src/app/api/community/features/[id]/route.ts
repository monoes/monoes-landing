import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { feature } from "@/lib/db/schema";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  const sessionUser = session?.user as { role?: string; blockedAt?: unknown } | undefined;
  const role = sessionUser?.role;
  if (!session || (role !== "admin" && role !== "moderator") || sessionUser?.blockedAt) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  const deleted = await db.delete(feature).where(eq(feature.id, id)).returning({ id: feature.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Feature not found" }, { status: 404 });
  }

  return NextResponse.json({ id });
}
