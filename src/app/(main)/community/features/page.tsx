import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { feature, featureVote, user } from "@/lib/db/schema";
import { FeatureList } from "@/components/community/features/FeatureList";

export const metadata: Metadata = {
  title: "Feature requests",
  alternates: { canonical: "/community/features" },
};

export const dynamic = "force-dynamic";

export default async function FeaturesPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });

  const db = getDb();
  const [features, votes, authors] = await Promise.all([
    db.select().from(feature),
    db.select().from(featureVote),
    db.select({ id: user.id, username: user.username }).from(user),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));
  const scoreByFeature = new Map<string, number>();
  const myVoteByFeature = new Map<string, number>();
  for (const v of votes) {
    scoreByFeature.set(v.featureId, (scoreByFeature.get(v.featureId) ?? 0) + v.value);
    if (session && v.userId === session.user.id) {
      myVoteByFeature.set(v.featureId, v.value);
    }
  }

  const items = features.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    authorUsername: authorMap.get(f.authorId) ?? null,
    status: f.status as "open" | "planned" | "shipped" | "declined",
    createdAt: f.createdAt.toISOString(),
    score: scoreByFeature.get(f.id) ?? 0,
    myVote: (myVoteByFeature.get(f.id) ?? 0) as -1 | 0 | 1,
  }));

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Feature requests</h1>
        <FeatureList initialFeatures={items} />
      </div>
    </main>
  );
}
