import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { post, postVote, user } from "@/lib/db/schema";
import { PostDetail } from "@/components/community/posts/PostDetail";

export const metadata: Metadata = {
  title: "Post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });

  const db = getDb();
  const [postRow] = await db.select().from(post).where(eq(post.id, id)).limit(1);
  if (!postRow) {
    notFound();
  }

  const [votes, authorRows] = await Promise.all([
    db.select({ value: postVote.value, userId: postVote.userId }).from(postVote).where(eq(postVote.postId, id)),
    db.select({ username: user.username }).from(user).where(eq(user.id, postRow.authorId)).limit(1),
  ]);

  const score = votes.reduce((sum, v) => sum + v.value, 0);
  const myVote = (votes.find((v) => v.userId === session?.user.id)?.value ?? 0) as -1 | 0 | 1;

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <PostDetail
          post={{
            id: postRow.id,
            title: postRow.title,
            body: postRow.body,
            authorUsername: authorRows[0]?.username ?? null,
            createdAt: postRow.createdAt.toISOString(),
            score,
            myVote,
          }}
        />
      </div>
    </main>
  );
}
