import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { orgUpload, user } from "@/lib/db/schema";
import { OrgGallery } from "@/components/community/orgs/OrgGallery";

export const metadata: Metadata = {
  title: "Org gallery",
  alternates: { canonical: "/community/orgs" },
};

export const dynamic = "force-dynamic";

export default async function OrgsPage() {
  const db = getDb();
  const [orgs, authors] = await Promise.all([
    db.select().from(orgUpload),
    db.select({ id: user.id, username: user.username }).from(user),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));

  const items = orgs
    .map((o) => ({
      id: o.id,
      name: o.name,
      goal: o.goal,
      topology: o.topology,
      roleCount: o.roleCount,
      uploaderUsername: authorMap.get(o.uploaderId) ?? null,
      createdAt: o.createdAt.toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Org gallery</h1>
        <OrgGallery initialOrgs={items} />
      </div>
    </main>
  );
}
