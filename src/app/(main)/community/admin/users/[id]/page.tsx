import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getAdminUserDetail } from "@/lib/community/admin-user-data";
import { UserDetail } from "@/components/community/admin/UserDetail";

export const metadata: Metadata = {
  title: "User details",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") {
    redirect("/community");
  }

  const { id } = await params;
  const detail = await getAdminUserDetail(getDb(), id);
  if (!detail) notFound();

  return (
    <main className="bg-ivory-warm px-8 pt-24 pb-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/community/admin" className="mb-2 inline-block text-xs uppercase tracking-label text-gold-dark font-medium hover:underline">
          ← Admin
        </Link>
        <UserDetail detail={detail} />
      </div>
    </main>
  );
}
