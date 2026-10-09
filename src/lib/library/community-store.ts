import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { orgComment, orgVote, user } from "@/lib/db/schema";
import { libraryComment, libraryVote } from "@/lib/db/library-schema";

// Community votes and comments on library items. Library items use
// library_vote / library_comment; gallery orgs (org_upload rows exposed as
// kind=org items) keep using org_vote / org_comment.

export type Source = "library" | "gallery";
export type VoteSummary = { score: number; myVote: -1 | 0 | 1 };

// D1 caps bound parameters per statement at 100.
const CHUNK = 90;

function chunks<T>(values: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < values.length; i += CHUNK) out.push(values.slice(i, i + CHUNK));
  return out;
}

/** Net score and the viewer's own vote for each item, keyed by id. */
export async function voteSummaries(
  db: Db,
  refs: { id: string; source: Source }[],
  viewerId: string | null,
): Promise<Map<string, VoteSummary>> {
  const out = new Map<string, VoteSummary>();
  const add = (id: string, userId: string, value: number) => {
    const s = out.get(id) ?? { score: 0, myVote: 0 };
    s.score += value;
    if (viewerId && userId === viewerId) s.myVote = value as -1 | 1;
    out.set(id, s);
  };
  const libraryIds = refs.filter((r) => r.source === "library").map((r) => r.id);
  const galleryIds = refs.filter((r) => r.source === "gallery").map((r) => r.id);
  for (const ids of chunks(libraryIds)) {
    const rows = await db
      .select({ id: libraryVote.itemId, userId: libraryVote.userId, value: libraryVote.value })
      .from(libraryVote)
      .where(inArray(libraryVote.itemId, ids));
    for (const r of rows) add(r.id, r.userId, r.value);
  }
  for (const ids of chunks(galleryIds)) {
    const rows = await db
      .select({ id: orgVote.orgUploadId, userId: orgVote.userId, value: orgVote.value })
      .from(orgVote)
      .where(inArray(orgVote.orgUploadId, ids));
    for (const r of rows) add(r.id, r.userId, r.value);
  }
  return out;
}

/** Sets (1/-1) or clears (0) the user's vote; returns the new summary. */
export async function castVote(db: Db, itemId: string, userId: string, value: -1 | 0 | 1): Promise<VoteSummary> {
  if (value === 0) {
    await db.delete(libraryVote).where(and(eq(libraryVote.itemId, itemId), eq(libraryVote.userId, userId)));
  } else {
    await db
      .insert(libraryVote)
      .values({ id: crypto.randomUUID(), itemId, userId, value, createdAt: new Date() })
      .onConflictDoUpdate({ target: [libraryVote.itemId, libraryVote.userId], set: { value } });
  }
  const summary = (await voteSummaries(db, [{ id: itemId, source: "library" }], userId)).get(itemId);
  return summary ?? { score: 0, myVote: 0 };
}

export type CommentView = { id: string; authorId: string; authorUsername: string | null; body: string; createdAt: string };

/** Oldest first, like org comments. */
export async function listComments(db: Db, itemId: string, source: Source): Promise<CommentView[]> {
  const rows =
    source === "library"
      ? await db
          .select({ id: libraryComment.id, authorId: libraryComment.authorId, body: libraryComment.body, createdAt: libraryComment.createdAt, username: user.username })
          .from(libraryComment)
          .leftJoin(user, eq(user.id, libraryComment.authorId))
          .where(eq(libraryComment.itemId, itemId))
      : await db
          .select({ id: orgComment.id, authorId: orgComment.authorId, body: orgComment.body, createdAt: orgComment.createdAt, username: user.username })
          .from(orgComment)
          .leftJoin(user, eq(user.id, orgComment.authorId))
          .where(eq(orgComment.orgUploadId, itemId));
  return rows
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((r) => ({ id: r.id, authorId: r.authorId, authorUsername: r.username ?? null, body: r.body, createdAt: r.createdAt.toISOString() }));
}

export async function addComment(db: Db, itemId: string, authorId: string, body: string): Promise<CommentView> {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(libraryComment).values({ id, itemId, authorId, body, createdAt: now });
  const [author] = await db.select({ username: user.username }).from(user).where(eq(user.id, authorId)).limit(1);
  return { id, authorId, authorUsername: author?.username ?? null, body, createdAt: now.toISOString() };
}

export async function findComment(db: Db, itemId: string, commentId: string) {
  const [row] = await db
    .select({ id: libraryComment.id, authorId: libraryComment.authorId })
    .from(libraryComment)
    .where(and(eq(libraryComment.id, commentId), eq(libraryComment.itemId, itemId)))
    .limit(1);
  return row ?? null;
}

export async function deleteComment(db: Db, commentId: string): Promise<void> {
  await db.delete(libraryComment).where(eq(libraryComment.id, commentId));
}
