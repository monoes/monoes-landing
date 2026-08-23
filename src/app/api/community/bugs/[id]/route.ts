import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { bug } from "@/lib/db/schema";
import { isModerator } from "@/lib/community/is-moderator";

export function isValidStatus(value: unknown): value is "open" | "in_progress" | "resolved" | "wontfix" {
  return value === "open" || value === "in_progress" || value === "resolved" || value === "wontfix";
}

export function isValidSeverity(value: unknown): value is "low" | "medium" | "high" | "critical" {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: unknown; severity?: unknown } | null;

  if (body?.status === undefined && body?.severity === undefined) {
    return NextResponse.json({ error: "status or severity is required" }, { status: 400 });
  }
  if (body.status !== undefined && !isValidStatus(body.status)) {
    return NextResponse.json(
      { error: "status must be 'open', 'in_progress', 'resolved', or 'wontfix'" },
      { status: 400 },
    );
  }
  if (body.severity !== undefined && !isValidSeverity(body.severity)) {
    return NextResponse.json(
      { error: "severity must be 'low', 'medium', 'high', or 'critical'" },
      { status: 400 },
    );
  }

  const set: { status?: "open" | "in_progress" | "resolved" | "wontfix"; severity?: "low" | "medium" | "high" | "critical"; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (body.status !== undefined) set.status = body.status;
  if (body.severity !== undefined) set.severity = body.severity;

  const db = getDb();
  const updated = await db.update(bug).set(set).where(eq(bug.id, id)).returning({ id: bug.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }

  return NextResponse.json({ status: body.status, severity: body.severity });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  const deleted = await db.delete(bug).where(eq(bug.id, id)).returning({ id: bug.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }

  return NextResponse.json({ id });
}
