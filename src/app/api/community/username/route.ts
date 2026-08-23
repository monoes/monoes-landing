import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";

export function isValidUsername(value: string): boolean {
  return /^[a-zA-Z0-9_-]{3,24}$/.test(value);
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { username?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username.trim() : "";

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username must be 3-24 characters: letters, numbers, underscore, hyphen." },
      { status: 400 },
    );
  }

  const db = getDb();
  const existing = await db.select().from(user).where(eq(user.username, username)).limit(1);
  if (existing.length > 0 && existing[0].id !== session.user.id) {
    return NextResponse.json({ error: "Username already taken." }, { status: 400 });
  }

  await db.update(user).set({ username, updatedAt: new Date() }).where(eq(user.id, session.user.id));

  return NextResponse.json({ username });
}
