import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgUpload, orgRun, orgRunFile, user } from "@/lib/db/schema";
import { OrgDetail } from "@/components/community/orgs/OrgDetail";
import { canDeleteOrgUpload } from "@/lib/community/can-delete-org-upload";
import { canDeleteOrgRun } from "@/lib/community/can-delete-org-run";

export const metadata: Metadata = {
  title: "Org detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  const sessionUser = session?.user as { id: string; role?: string; username?: string | null } | undefined;

  const db = getDb();
  const [row] = await db.select().from(orgUpload).where(eq(orgUpload.id, id)).limit(1);
  if (!row) {
    notFound();
  }

  type ParsedRole = {
    id: string;
    title?: string;
    type?: string;
    reports_to?: string | null;
    responsibilities?: string[];
    adapter_config?: { model?: string };
    policy?: { git?: string; allowTools?: string[]; denyTools?: string[] };
  };
  const parsed = JSON.parse(row.orgJson) as { roles?: ParsedRole[] };
  const roles = Array.isArray(parsed.roles) ? parsed.roles : [];

  const canDelete = !!sessionUser && canDeleteOrgUpload(sessionUser, row.uploaderId);

  const [runRows, fileRows, authors] = await Promise.all([
    db.select().from(orgRun).where(eq(orgRun.orgUploadId, id)).orderBy(desc(orgRun.createdAt)),
    db.select().from(orgRunFile),
    db.select({ id: user.id, username: user.username }).from(user),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));
  const filesByRun = new Map<string, typeof fileRows>();
  for (const f of fileRows) {
    const list = filesByRun.get(f.orgRunId) ?? [];
    list.push(f);
    filesByRun.set(f.orgRunId, list);
  }

  const runs = runRows.map((r) => ({
    id: r.id,
    label: r.label,
    uploaderUsername: authorMap.get(r.uploaderId) ?? null,
    createdAt: r.createdAt.toISOString(),
    canDelete: !!sessionUser && canDeleteOrgRun(sessionUser, r.uploaderId),
    files: (filesByRun.get(r.id) ?? []).map((f) => ({
      id: f.id,
      filename: f.filename,
      fileType: f.fileType as "md" | "html",
    })),
  }));

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <OrgDetail
          org={{
            id: row.id,
            name: row.name,
            goal: row.goal,
            topology: row.topology,
            roles,
            orgJson: row.orgJson,
            canDelete,
            runs,
            currentUsername: sessionUser?.username ?? null,
          }}
        />
      </div>
    </main>
  );
}
