import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { buildFirstApplication } from "@/lib/db/schema";
import { MAX_PARALLEL_BUILDS, validateApplication } from "@/lib/build-first";

const MAX_BODY_BYTES = 20_000;

export function isWaitlisted(activeBuilds: number): boolean {
  return activeBuilds >= MAX_PARALLEL_BUILDS;
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Honeypot: real people never fill the hidden field. Pretend success, store nothing.
  if (body && typeof body === "object" && (body as { companyFax?: unknown }).companyFax) {
    return NextResponse.json({ status: "received" }, { status: 201 });
  }

  const result = validateApplication(body);
  if (!result.ok) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors: result.fieldErrors }, { status: 400 });
  }
  const d = result.data;

  const db = getDb();
  const active = await db
    .select({ id: buildFirstApplication.id })
    .from(buildFirstApplication)
    .where(eq(buildFirstApplication.status, "building"));
  const status = isWaitlisted(active.length) ? "waitlist" : "new";

  const now = new Date();
  await db.insert(buildFirstApplication).values({
    id: crypto.randomUUID(),
    status,
    audience: d.audience,
    line: d.line,
    fullName: d.fullName,
    email: d.email,
    role: d.role,
    organization: d.organization,
    website: d.website ?? null,
    country: d.country,
    canSign: d.canSign === "yes",
    signerContact: d.signerContact ?? null,
    profile: d.profile,
    dealStructure: d.dealStructure,
    budgetRange: d.budgetRange,
    description: d.description,
    regulated: d.regulated === "yes",
    regulatedDetail: d.regulatedDetail ?? null,
    systems: d.systems ?? null,
    consentAt: now,
    createdAt: now,
  });

  return NextResponse.json({ status: status === "waitlist" ? "waitlisted" : "received" }, { status: 201 });
}
