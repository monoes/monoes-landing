import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function isValidAvatarContentType(contentType: string): boolean {
  return contentType in CONTENT_TYPE_EXT;
}

export function isValidAvatarSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_AVATAR_BYTES;
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No avatar file provided." }, { status: 400 });
  }

  if (!isValidAvatarContentType(file.type)) {
    return NextResponse.json({ error: "Avatar must be a PNG, JPEG, or WebP image." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Avatar file is empty." }, { status: 400 });
  }
  if (!isValidAvatarSize(file.size)) {
    return NextResponse.json({ error: "Avatar must be 2 MB or smaller." }, { status: 400 });
  }

  const key = `avatars/${session.user.id}`;

  const { env } = getCloudflareContext();
  await env.AVATARS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const db = getDb();
  const now = new Date();
  await db.update(user).set({ avatarKey: key, updatedAt: now }).where(eq(user.id, session.user.id));

  return NextResponse.json({ avatarKey: key, updatedAt: now.toISOString() });
}
