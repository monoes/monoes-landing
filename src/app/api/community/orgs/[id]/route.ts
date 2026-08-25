import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { canEditOrgUpload } from "@/lib/community/can-edit-org-upload";
import { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";

export function isValidName(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 100;
}

export function isValidTagline(value: string): boolean {
  return value.length <= 150;
}

export function isValidDescription(value: string): boolean {
  return value.length <= 1000;
}

export function isValidBody(value: string): boolean {
  return value.length <= 20000;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  const [existingOrg] = await db.select({ uploaderId: orgUpload.uploaderId }).from(orgUpload).where(eq(orgUpload.id, id)).limit(1);
  if (!existingOrg) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }
  if (!canEditOrgUpload(session.user, existingOrg.uploaderId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; tagline?: unknown; description?: unknown; body?: unknown }
    | null;

  const updates: { name?: string; tagline?: string | null; description?: string | null; body?: string | null } = {};

  if (body?.name !== undefined) {
    if (typeof body.name !== "string" || !isValidName(body.name)) {
      return NextResponse.json({ error: "Name must be 1-100 characters." }, { status: 400 });
    }
    updates.name = body.name.trim();
  }
  if (body?.tagline !== undefined) {
    if (typeof body.tagline !== "string" || !isValidTagline(body.tagline)) {
      return NextResponse.json({ error: "Tagline must be 150 characters or fewer." }, { status: 400 });
    }
    updates.tagline = body.tagline.trim() || null;
  }
  if (body?.description !== undefined) {
    if (typeof body.description !== "string" || !isValidDescription(body.description)) {
      return NextResponse.json({ error: "Description must be 1000 characters or fewer." }, { status: 400 });
    }
    updates.description = body.description.trim() || null;
  }
  if (body?.body !== undefined) {
    if (typeof body.body !== "string" || !isValidBody(body.body)) {
      return NextResponse.json({ error: "Body must be 20000 characters or fewer." }, { status: 400 });
    }
    updates.body = body.body.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  await db.update(orgUpload).set(updates).where(eq(orgUpload.id, id));

  return NextResponse.json({ id, ...updates });
}
