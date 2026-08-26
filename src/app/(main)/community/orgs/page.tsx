import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orgUpload, user, orgVote } from "@/lib/db/schema";
import { OrgGallery } from "@/components/community/orgs/OrgGallery";

export const metadata: Metadata = {
  title: "Org gallery",
  alternates: { canonical: "/community/orgs" },
};

export const dynamic = "force-dynamic";

export default async function OrgsPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });

  const db = getDb();
  const [orgs, authors, votes] = await Promise.all([
    db.select().from(orgUpload),
    db.select({ id: user.id, username: user.username }).from(user),
    db.select().from(orgVote),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));
  const scoreByOrg = new Map<string, number>();
  const myVoteByOrg = new Map<string, number>();
  for (const v of votes) {
    scoreByOrg.set(v.orgUploadId, (scoreByOrg.get(v.orgUploadId) ?? 0) + v.value);
    if (session && v.userId === session.user.id) {
      myVoteByOrg.set(v.orgUploadId, v.value);
    }
  }

  const items = orgs
    .map((o) => ({
      id: o.id,
      name: o.name,
      goal: o.goal,
      tagline: o.tagline,
      topology: o.topology,
      roleCount: o.roleCount,
      uploaderUsername: authorMap.get(o.uploaderId) ?? null,
      createdAt: o.createdAt.toISOString(),
      score: scoreByOrg.get(o.id) ?? 0,
      myVote: (myVoteByOrg.get(o.id) ?? 0) as -1 | 0 | 1,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <main className="bg-ivory-warm px-8 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Org gallery</h1>
        <OrgGallery
          initialOrgs={items}
          currentUsername={(session?.user as { username?: string | null } | undefined)?.username ?? null}
        />
      </div>
    </main>
  );
}
