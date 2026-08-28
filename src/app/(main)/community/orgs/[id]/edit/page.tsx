import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";
import { canEditOrgUpload } from "@/lib/community/can-edit-org-upload";
import { OrgEditForm } from "@/components/community/orgs/OrgEditForm";

export const metadata: Metadata = { title: "Edit org", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrgEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/community/login");

  const db = getDb();
  const [row] = await db.select().from(orgUpload).where(eq(orgUpload.id, id)).limit(1);
  if (!row) notFound();

  const sessionUser = session.user as { id: string; role?: string };
  if (!canEditOrgUpload(sessionUser, row.uploaderId)) {
    redirect(`/community/orgs/${id}`);
  }

  return (
    <main className="bg-ivory-warm px-8 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Edit org</h1>
        <OrgEditForm
          orgId={id}
          initial={{
            name: row.name,
            tagline: row.tagline ?? "",
            description: row.description ?? "",
            body: row.body ?? "",
            bannerUrl: row.bannerUrl,
          }}
        />
      </div>
    </main>
  );
}
