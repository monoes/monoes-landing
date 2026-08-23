import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { feature } from "@/lib/db/schema";

export function isValidTitle(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 100;
}

export function isValidDescription(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 1000;
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { title?: unknown; description?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!isValidTitle(title)) {
    return NextResponse.json({ error: "Title must be 1-100 characters." }, { status: 400 });
  }
  if (!isValidDescription(description)) {
    return NextResponse.json({ error: "Description must be 1-1000 characters." }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  await db.insert(feature).values({
    id,
    title,
    description,
    authorId: session.user.id,
    status: "open",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    {
      id,
      title,
      description,
      authorId: session.user.id,
      status: "open",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    { status: 201 },
  );
}
