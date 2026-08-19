import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user, feature, featureVote, bug, bugComment, bugLabel, bugLabelLink } from "@/lib/db/schema";
import { AdminDashboard } from "@/components/community/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") {
    redirect("/community");
  }

  const db = getDb();
  const [rows, featureRows, votes, bugRows, commentRows, labelRows, labelLinkRows, authors] = await Promise.all([
    db
      .select({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        blockedAt: user.blockedAt,
        createdAt: user.createdAt,
      })
      .from(user),
    db.select().from(feature),
    db.select().from(featureVote),
    db.select().from(bug),
    db.select({ bugId: bugComment.bugId }).from(bugComment),
    db.select().from(bugLabel),
    db.select().from(bugLabelLink),
    db.select({ id: user.id, username: user.username }).from(user),
  ]);

  const users = rows.map((u) => ({
    ...u,
    role: u.role as "member" | "moderator" | "admin",
    blockedAt: u.blockedAt ? u.blockedAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));
  const scoreByFeature = new Map<string, number>();
  for (const v of votes) {
    scoreByFeature.set(v.featureId, (scoreByFeature.get(v.featureId) ?? 0) + v.value);
  }
  const features = featureRows.map((f) => ({
    id: f.id,
    title: f.title,
    authorUsername: authorMap.get(f.authorId) ?? null,
    status: f.status as "open" | "planned" | "shipped" | "declined",
    score: scoreByFeature.get(f.id) ?? 0,
    createdAt: f.createdAt.toISOString(),
  }));

  const labelById = new Map(labelRows.map((l) => [l.id, l]));
  const commentCountByBug = new Map<string, number>();
  for (const c of commentRows) {
    commentCountByBug.set(c.bugId, (commentCountByBug.get(c.bugId) ?? 0) + 1);
  }
  const labelsByBug = new Map<string, { id: string; name: string; color: string }[]>();
  for (const link of labelLinkRows) {
    const label = labelById.get(link.labelId);
    if (!label) continue;
    const list = labelsByBug.get(link.bugId) ?? [];
    list.push({ id: label.id, name: label.name, color: label.color });
    labelsByBug.set(link.bugId, list);
  }
  const bugs = bugRows.map((b) => ({
    id: b.id,
    title: b.title,
    authorUsername: authorMap.get(b.authorId) ?? null,
    status: b.status as "open" | "in_progress" | "resolved" | "wontfix",
    severity: b.severity as "low" | "medium" | "high" | "critical",
    commentCount: commentCountByBug.get(b.id) ?? 0,
    labels: labelsByBug.get(b.id) ?? [],
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Admin</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Dashboard</h1>
        <AdminDashboard users={users} features={features} bugs={bugs} />
      </div>
    </main>
  );
}
