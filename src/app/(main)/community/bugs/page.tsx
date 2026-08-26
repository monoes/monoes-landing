import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bug, bugComment, bugLabel, bugLabelLink, user, bugVote } from "@/lib/db/schema";
import { BugList } from "@/components/community/bugs/BugList";

export const metadata: Metadata = {
  title: "Bug reports",
  alternates: { canonical: "/community/bugs" },
};

export const dynamic = "force-dynamic";

export default async function BugsPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });

  const db = getDb();
  const [bugs, comments, labels, labelLinks, authors, votes] = await Promise.all([
    db.select().from(bug),
    db.select({ bugId: bugComment.bugId }).from(bugComment),
    db.select().from(bugLabel),
    db.select().from(bugLabelLink),
    db.select({ id: user.id, username: user.username }).from(user),
    db.select().from(bugVote),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));
  const labelById = new Map(labels.map((l) => [l.id, l]));
  const commentCountByBug = new Map<string, number>();
  for (const c of comments) {
    commentCountByBug.set(c.bugId, (commentCountByBug.get(c.bugId) ?? 0) + 1);
  }
  const labelsByBug = new Map<string, { id: string; name: string; color: string }[]>();
  for (const link of labelLinks) {
    const label = labelById.get(link.labelId);
    if (!label) continue;
    const list = labelsByBug.get(link.bugId) ?? [];
    list.push({ id: label.id, name: label.name, color: label.color });
    labelsByBug.set(link.bugId, list);
  }
  const scoreByBug = new Map<string, number>();
  const myVoteByBug = new Map<string, number>();
  for (const v of votes) {
    scoreByBug.set(v.bugId, (scoreByBug.get(v.bugId) ?? 0) + v.value);
    if (session && v.userId === session.user.id) {
      myVoteByBug.set(v.bugId, v.value);
    }
  }

  const items = bugs.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description,
    authorUsername: authorMap.get(b.authorId) ?? null,
    status: b.status as "open" | "in_progress" | "resolved" | "wontfix",
    severity: b.severity as "low" | "medium" | "high" | "critical",
    createdAt: b.createdAt.toISOString(),
    commentCount: commentCountByBug.get(b.id) ?? 0,
    labels: labelsByBug.get(b.id) ?? [],
    score: scoreByBug.get(b.id) ?? 0,
    myVote: (myVoteByBug.get(b.id) ?? 0) as -1 | 0 | 1,
  }));

  return (
    <main className="bg-ivory-warm px-8 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-3xl font-semibold text-espresso tracking-tight">Bug reports</h1>
        <BugList
          initialBugs={items}
          availableLabels={labels.map((l) => ({ id: l.id, name: l.name }))}
          currentUsername={(session?.user as { username?: string | null } | undefined)?.username ?? null}
        />
      </div>
    </main>
  );
}
