import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { ProfileCard, type Profile } from "@/components/community/profile/ProfileCard";

export const dynamic = "force-dynamic";

async function loadProfile(username: string): Promise<Profile | null> {
  const db = getDb();
  const rows = await db.select().from(user).where(eq(user.username, username)).limit(1);
  const row = rows[0];
  if (!row) return null;

  return {
    name: row.name,
    username: row.username ?? username,
    tagline: row.tagline,
    jobTitle: row.jobTitle,
    company: row.company,
    tags: row.tagsJson ? (JSON.parse(row.tagsJson) as string[]) : [],
    githubUrl: row.githubUrl,
    twitterUrl: row.twitterUrl,
    linkedinUrl: row.linkedinUrl,
    websiteUrl: row.websiteUrl,
    avatarUrl: row.avatarKey ? `/api/images/avatar/${row.avatarKey}?v=${row.updatedAt.getTime()}` : null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}`, alternates: { canonical: `/community/u/${username}` } };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await loadProfile(username);
  if (!profile) notFound();

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <ProfileCard profile={profile} />
    </main>
  );
}
