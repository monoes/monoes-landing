import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user, feature, featureVote } from "@/lib/db/schema";
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
  const [rows, featureRows, votes, authors] = await Promise.all([
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

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Admin</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Dashboard</h1>
        <AdminDashboard users={users} features={features} />
      </div>
    </main>
  );
}
