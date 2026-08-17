import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { AdminDashboard } from "@/components/community/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await getAuth().api.getSession({ headers: await headers() });
  const db = getDb();
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      blockedAt: user.blockedAt,
      createdAt: user.createdAt,
    })
    .from(user);

  const users = rows.map((u) => ({
    ...u,
    role: u.role as "member" | "moderator" | "admin",
    blockedAt: u.blockedAt ? u.blockedAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Admin</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Dashboard</h1>
        <AdminDashboard users={users} />
      </div>
    </main>
  );
}
