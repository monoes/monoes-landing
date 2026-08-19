import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bugLabel } from "@/lib/db/schema";
import { isModerator } from "@/lib/community/is-moderator";

export function isValidLabelName(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 30;
}

export function isValidLabelColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { name?: unknown; color?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const color = typeof body?.color === "string" ? body.color.trim() : "";

  if (!isValidLabelName(name)) {
    return NextResponse.json({ error: "Label name must be 1-30 characters." }, { status: 400 });
  }
  if (!isValidLabelColor(color)) {
    return NextResponse.json({ error: "Label color must be a 6-digit hex color, e.g. #e11d48." }, { status: 400 });
  }

  const db = getDb();
  const [existingLabel] = await db.select({ id: bugLabel.id }).from(bugLabel).where(eq(bugLabel.name, name)).limit(1);
  if (existingLabel) {
    return NextResponse.json({ error: "A label with this name already exists." }, { status: 409 });
  }

  const id = crypto.randomUUID();
  await db.insert(bugLabel).values({ id, name, color });

  return NextResponse.json({ id, name, color }, { status: 201 });
}
