import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function GET(request: Request) {
  const session = await getAuthenticatedUser(request, "community:read");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  const [row] = await db
    .select({ name: user.name, avatarKey: user.avatarKey, updatedAt: user.updatedAt })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return NextResponse.json({
    id: session.user.id,
    username: session.user.username,
    name: row?.name ?? null,
    avatarUrl: row?.avatarKey ? `/api/images/avatar/${row.avatarKey}?v=${row.updatedAt.getTime()}` : null,
  });
}
