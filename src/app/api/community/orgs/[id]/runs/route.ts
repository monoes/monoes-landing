import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgUpload, orgRun, orgRunFile } from "@/lib/db/schema";

const MAX_FILES = 10;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_FILENAME_LENGTH = 150;

export function getFileType(filename: string): "md" | "html" | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".md")) return "md";
  if (lower.endsWith(".html")) return "html";
  return null;
}

export function isValidRunLabel(value: string): boolean {
  return value.trim().length <= 100;
}

export function sanitizeFilename(filename: string): string {
  const cleaned = filename
    .split(/[/\\]/)
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .join("-")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim();

  if (cleaned.length <= MAX_FILENAME_LENGTH) return cleaned;

  const lastDot = cleaned.lastIndexOf(".");
  const ext = lastDot >= 0 ? cleaned.slice(lastDot) : "";
  const base = lastDot >= 0 ? cleaned.slice(0, lastDot) : cleaned;
  const keep = MAX_FILENAME_LENGTH - ext.length;
  return base.slice(0, Math.max(0, keep)) + ext;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  const [existingOrg] = await db.select({ id: orgUpload.id }).from(orgUpload).where(eq(orgUpload.id, id)).limit(1);
  if (!existingOrg) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const label = typeof formData.get("label") === "string" ? (formData.get("label") as string).trim() : "";
  if (!isValidRunLabel(label)) {
    return NextResponse.json({ error: "Label must be 100 characters or fewer." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `No more than ${MAX_FILES} files per run.` }, { status: 400 });
  }

  for (const file of files) {
    const fileType = getFileType(file.name);
    if (!fileType) {
      return NextResponse.json({ error: `${file.name}: only .md and .html files are allowed.` }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: `${file.name}: file is empty.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `${file.name}: must be 2 MB or smaller.` }, { status: 400 });
    }
  }

  const { env } = getCloudflareContext();
  const db2 = getDb();
  const now = new Date();
  const runId = crypto.randomUUID();

  await db2.insert(orgRun).values({
    id: runId,
    orgUploadId: id,
    uploaderId: session.user.id,
    label: label || null,
    createdAt: now,
  });

  const createdFiles: { id: string; filename: string; fileType: string; sizeBytes: number }[] = [];

  for (const file of files) {
    const fileType = getFileType(file.name) as "md" | "html";
    const fileId = crypto.randomUUID();
    const safeName = sanitizeFilename(file.name);
    const r2Key = `org-runs/${runId}/${fileId}-${safeName}`;

    await env.ORG_FILES.put(r2Key, await file.arrayBuffer(), {
      httpMetadata: { contentType: fileType === "md" ? "text/markdown" : "text/html" },
    });

    await db2.insert(orgRunFile).values({
      id: fileId,
      orgRunId: runId,
      filename: safeName,
      fileType,
      r2Key,
      sizeBytes: file.size,
      createdAt: now,
    });

    createdFiles.push({ id: fileId, filename: safeName, fileType, sizeBytes: file.size });
  }

  return NextResponse.json(
    {
      id: runId,
      label: label || null,
      createdAt: now.toISOString(),
      files: createdFiles,
    },
    { status: 201 },
  );
}
