import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";
import { OrgDefSchema, type OrgDef } from "@/lib/org-schema";

const MAX_ORG_JSON_BYTES = 500_000;

export function isValidOrgJsonSize(text: string): boolean {
  return new TextEncoder().encode(text).length <= MAX_ORG_JSON_BYTES;
}

export function parseAndValidateOrgJson(text: string): { success: true; data: OrgDef } | { success: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { success: false, error: "File is not valid JSON." };
  }

  const result = OrgDefSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { success: false, error: `${issue.path.join(".")}: ${issue.message}` };
  }

  return { success: true, data: result.data };
}

export function extractTopology(org: OrgDef): string | null {
  const value = (org as Record<string, unknown>).topology;
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  // JSON-escaping the org text into the {"orgJson": "..."} envelope roughly
  // doubles quotes/backslashes/newlines, so give the envelope headroom over
  // the raw-text limit rather than comparing 1:1 — otherwise a legitimate
  // file near the limit gets falsely rejected. A missing or malformed header
  // (e.g. chunked transfer-encoding) is rejected outright rather than let
  // through, since every real client here sends a real content-length and
  // letting an unmeasured body through would defeat the point of this check.
  if (!Number.isFinite(contentLength) || contentLength > MAX_ORG_JSON_BYTES * 2 + 1024) {
    return NextResponse.json({ error: `File exceeds ${MAX_ORG_JSON_BYTES / 1000} KB limit.` }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { orgJson?: unknown } | null;
  const orgJsonText = typeof body?.orgJson === "string" ? body.orgJson : "";

  if (!orgJsonText) {
    return NextResponse.json({ error: "orgJson is required" }, { status: 400 });
  }
  if (!isValidOrgJsonSize(orgJsonText)) {
    return NextResponse.json({ error: `File exceeds ${MAX_ORG_JSON_BYTES / 1000} KB limit.` }, { status: 400 });
  }

  const validated = parseAndValidateOrgJson(orgJsonText);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const org = validated.data;
  const topology = extractTopology(org);

  const db = getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  await db.insert(orgUpload).values({
    id,
    name: org.name,
    goal: org.goal,
    topology,
    roleCount: org.roles.length,
    orgJson: orgJsonText,
    uploaderId: session.user.id,
    createdAt: now,
  });

  return NextResponse.json(
    {
      id,
      name: org.name,
      goal: org.goal,
      topology,
      roleCount: org.roles.length,
      createdAt: now.toISOString(),
    },
    { status: 201 },
  );
}
