import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { orgRunFile } from "@/lib/db/schema";
import { renderMarkdown } from "@/lib/community/render-markdown";

export const metadata: Metadata = {
  title: "Output file",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrgRunFilePage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  const db = getDb();
  const [fileRow] = await db
    .select({ filename: orgRunFile.filename, fileType: orgRunFile.fileType, r2Key: orgRunFile.r2Key })
    .from(orgRunFile)
    .where(eq(orgRunFile.id, fileId))
    .limit(1);

  if (!fileRow) {
    notFound();
  }

  if (fileRow.fileType === "html") {
    redirect(`/api/community/org-run-files/${fileId}`);
  }

  const { env } = getCloudflareContext();
  const object = await env.ORG_FILES.get(fileRow.r2Key);
  if (!object) {
    notFound();
  }
  const raw = await object.text();

  return (
    <main className="bg-ivory-warm px-8 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Output file</p>
        <p className="mb-6 font-medium text-espresso">{fileRow.filename}</p>
        <div
          className="markdown-body max-w-none rounded-lg border border-ivory-linen bg-ivory p-5"
          // renderMarkdown sanitizes via isomorphic-dompurify before this ever reaches dangerouslySetInnerHTML
          dangerouslySetInnerHTML={{ __html: renderMarkdown(raw) }}
        />
      </div>
    </main>
  );
}
