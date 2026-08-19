import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bug, bugComment, bugLabel, bugLabelLink, user } from "@/lib/db/schema";
import { BugDetail } from "@/components/community/bugs/BugDetail";

export const metadata: Metadata = {
  title: "Bug report",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BugDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  const sessionUser = session?.user as { id: string; role?: string } | undefined;
  const canModerate = sessionUser?.role === "admin" || sessionUser?.role === "moderator";

  const db = getDb();
  const [bugRow] = await db.select().from(bug).where(eq(bug.id, id)).limit(1);
  if (!bugRow) {
    notFound();
  }

  const [commentRows, labelLinks, allLabelRows, authors] = await Promise.all([
    db.select().from(bugComment).where(eq(bugComment.bugId, id)),
    db.select().from(bugLabelLink).where(eq(bugLabelLink.bugId, id)),
    db.select().from(bugLabel),
    db.select({ id: user.id, username: user.username }).from(user),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));
  const labelById = new Map(allLabelRows.map((l) => [l.id, l]));
  const attachedLabels = labelLinks
    .map((link) => labelById.get(link.labelId))
    .filter((l): l is (typeof allLabelRows)[number] => !!l)
    .map((l) => ({ id: l.id, name: l.name, color: l.color }));

  const comments = commentRows
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorUsername: authorMap.get(c.authorId) ?? null,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));

  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <BugDetail
          bug={{
            id: bugRow.id,
            title: bugRow.title,
            description: bugRow.description,
            authorUsername: authorMap.get(bugRow.authorId) ?? null,
            status: bugRow.status as "open" | "in_progress" | "resolved" | "wontfix",
            severity: bugRow.severity as "low" | "medium" | "high" | "critical",
            createdAt: bugRow.createdAt.toISOString(),
            labels: attachedLabels,
          }}
          initialComments={comments}
          allLabels={allLabelRows.map((l) => ({ id: l.id, name: l.name, color: l.color }))}
          canModerate={canModerate}
          currentUserId={sessionUser?.id ?? null}
        />
      </div>
    </main>
  );
}
