import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";

export function isValidRole(value: unknown): value is "member" | "moderator" | "admin" {
  return value === "member" || value === "moderator" || value === "admin";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { role?: unknown } | null;
  if (!isValidRole(body?.role)) {
    return NextResponse.json({ error: "role must be 'member', 'moderator', or 'admin'" }, { status: 400 });
  }

  const db = getDb();
  await db.update(user).set({ role: body.role, updatedAt: new Date() }).where(eq(user.id, id));

  return NextResponse.json({ role: body.role });
}
