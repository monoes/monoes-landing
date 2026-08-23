import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { feature } from "@/lib/db/schema";

export function isValidStatus(value: unknown): value is "open" | "planned" | "shipped" | "declined" {
  return value === "open" || value === "planned" || value === "shipped" || value === "declined";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthenticatedUser(request, "community:write");
  const sessionUser = session?.user as { role?: string; blockedAt?: unknown } | undefined;
  if (!session || sessionUser?.role !== "admin" || sessionUser?.blockedAt) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  if (!isValidStatus(body?.status)) {
    return NextResponse.json(
      { error: "status must be 'open', 'planned', 'shipped', or 'declined'" },
      { status: 400 },
    );
  }

  const db = getDb();
  const updated = await db
    .update(feature)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(feature.id, id))
    .returning({ id: feature.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Feature not found" }, { status: 404 });
  }

  return NextResponse.json({ status: body.status });
}
