import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  const sessionUser = session?.user as { role?: string; blockedAt?: unknown } | undefined;
  if (!session || sessionUser?.role !== "admin" || sessionUser?.blockedAt) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  const users = await db
    .select({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      blockedAt: user.blockedAt,
      createdAt: user.createdAt,
    })
    .from(user);

  return NextResponse.json({ users });
}
