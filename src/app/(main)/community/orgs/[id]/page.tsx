import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";
import { OrgDetail } from "@/components/community/orgs/OrgDetail";

export const metadata: Metadata = {
  title: "Org detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  const sessionUser = session?.user as { id: string; role?: string } | undefined;

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
    policy?: { git?: string };
  };
  const parsed = JSON.parse(row.orgJson) as { roles?: ParsedRole[] };
  const roles = Array.isArray(parsed.roles) ? parsed.roles : [];

  const canDelete = !!sessionUser && (sessionUser.id === row.uploaderId || sessionUser.role === "admin" || sessionUser.role === "moderator");

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
          }}
        />
      </div>
    </main>
  );
}
