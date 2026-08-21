import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { ProfileForm } from "@/components/community/profile/ProfileForm";

export const metadata: Metadata = { title: "Edit profile" };
export const dynamic = "force-dynamic";

function parseTags(tagsJson: string | null | undefined): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export default async function ProfileSettingsPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/community/login");

  const db = getDb();
  const rows = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const row = rows[0];

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Edit profile</h1>
        <ProfileForm
          initial={{
            tagline: row?.tagline ?? "",
            jobTitle: row?.jobTitle ?? "",
            company: row?.company ?? "",
            tags: parseTags(row?.tagsJson),
            githubUrl: row?.githubUrl ?? "",
            twitterUrl: row?.twitterUrl ?? "",
            linkedinUrl: row?.linkedinUrl ?? "",
            websiteUrl: row?.websiteUrl ?? "",
            avatarUrl: row?.avatarKey ? `/api/images/avatar/${row.avatarKey}?v=${row.updatedAt.getTime()}` : null,
          }}
          username={row?.username ?? ""}
        />
      </div>
    </main>
  );
}
