import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { orgRunFile } from "@/lib/db/schema";

const CONTENT_TYPE: Record<string, string> = {
  md: "text/markdown",
  html: "text/html",
};

export async function GET(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  // Org content (run outputs included) is for logged-in members only.
  if (!(await getAuthenticatedUser(request, "community:read"))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { fileId } = await params;

  const db = getDb();
  const [fileRow] = await db
    .select({ r2Key: orgRunFile.r2Key, fileType: orgRunFile.fileType })
    .from(orgRunFile)
    .where(eq(orgRunFile.id, fileId))
    .limit(1);

  if (!fileRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { env } = getCloudflareContext();
  const object = await env.ORG_FILES.get(fileRow.r2Key);

  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(object.body as ReadableStream, {
    headers: {
      "Content-Type": CONTENT_TYPE[fileRow.fileType] ?? "text/plain",
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
    },
  });
}
