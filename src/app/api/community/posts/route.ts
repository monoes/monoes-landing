import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { post } from "@/lib/db/schema";

export function isValidTitle(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 100;
}

export function isValidBody(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 2000;
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { title?: unknown; body?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const postBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!isValidTitle(title)) {
    return NextResponse.json({ error: "Title must be 1-100 characters." }, { status: 400 });
  }
  if (!isValidBody(postBody)) {
    return NextResponse.json({ error: "Body must be 1-2000 characters." }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  await db.insert(post).values({
    id,
    title,
    body: postBody,
    authorId: session.user.id,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    { id, title, body: postBody, authorId: session.user.id, createdAt: now.toISOString() },
    { status: 201 },
  );
}
