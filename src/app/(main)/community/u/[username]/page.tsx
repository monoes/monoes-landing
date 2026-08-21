import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { ProfileCard, type Profile } from "@/components/community/profile/ProfileCard";
import { getFeedItems } from "@/lib/community/feed";
import { FeedList } from "@/components/community/feed/FeedList";
import { NewPostForm } from "@/components/community/profile/NewPostForm";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

type ProfileLookup = { profile: Profile; id: string; suspended: false } | { suspended: true; username: string } | null;

const loadProfile = cache(async (username: string): Promise<ProfileLookup> => {
  const db = getDb();
  const rows = await db.select().from(user).where(eq(user.username, username)).limit(1);
  const row = rows[0];
  if (!row) return null;

  if (row.blockedAt) {
    return { suspended: true, username: row.username ?? username };
  }

  return {
    suspended: false,
    id: row.id,
    profile: {
      name: row.name,
      username: row.username ?? username,
      tagline: row.tagline,
      jobTitle: row.jobTitle,
      company: row.company,
      tags: parseTags(row.tagsJson),
      githubUrl: row.githubUrl,
      twitterUrl: row.twitterUrl,
      linkedinUrl: row.linkedinUrl,
      websiteUrl: row.websiteUrl,
      avatarUrl: row.avatarKey ? `/api/images/avatar/${row.avatarKey}?v=${row.updatedAt.getTime()}` : null,
    },
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const result = await loadProfile(username);
  const description =
    result && !result.suspended && result.profile.tagline
      ? result.profile.tagline
      : `@${username}'s profile on Monoes.`;

  return {
    title: `@${username}`,
    description,
    alternates: { canonical: `/community/u/${username}` },
    openGraph: { title: `@${username} · Monoes`, description },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await loadProfile(username);
  if (!result) notFound();

  if (result.suspended) {
    return (
      <main className="bg-ivory-warm px-8 py-16">
        <div className="mx-auto max-w-xl rounded-xl border border-ivory-linen bg-ivory p-8 text-center">
          <p className="text-sm text-espresso/55">@{result.username}</p>
          <p className="mt-3 text-espresso">This account has been suspended.</p>
        </div>
      </main>
    );
  }

  const session = await getAuth().api.getSession({ headers: await headers() });
  const { items, hasMore } = await getFeedItems({
    sort: "latest",
    page: 0,
    authorId: result.id,
    currentUserId: session?.user.id,
  });

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <ProfileCard profile={result.profile} />
      <div className="mx-auto mt-10 max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold text-espresso">Activity</h2>
        {session?.user.id === result.id && <NewPostForm />}
        <FeedList initialItems={items} initialHasMore={hasMore} authorId={result.id} />
      </div>
    </main>
  );
}
