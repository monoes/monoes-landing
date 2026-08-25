import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { canEditOrgUpload } from "@/lib/community/can-edit-org-upload";
import { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function isValidImageContentType(contentType: string): boolean {
  return contentType in CONTENT_TYPE_EXT;
}

export function isValidImageSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_IMAGE_BYTES;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 });
  }

  if (!isValidImageContentType(file.type)) {
    return NextResponse.json({ error: "Image must be a PNG, JPEG, or WebP image." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Image file is empty." }, { status: 400 });
  }
  if (!isValidImageSize(file.size)) {
    return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 400 });
  }

  const ext = CONTENT_TYPE_EXT[file.type];
  const key = `org-body-images/${id}/${crypto.randomUUID()}.${ext}`;

  const { env } = getCloudflareContext();
  await env.ORG_FILES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return NextResponse.json({ url: `/api/images/org/${key}` }, { status: 201 });
}
