import { getDb } from "@/lib/db";
import { post, postVote, bug, bugVote, feature, featureVote, orgUpload, orgVote, user } from "@/lib/db/schema";

export type FeedItem = {
  id: string;
  type: "post" | "bug" | "feature" | "org";
  title: string;
  preview: string;
  authorId: string;
  authorUsername: string | null;
  createdAt: string;
  score: number;
  myVote: -1 | 0 | 1;
};

const PAGE_SIZE = 20;
const PREVIEW_TRUNCATE_LENGTH = 200;

function truncate(text: string): string {
  return text.length > PREVIEW_TRUNCATE_LENGTH ? `${text.slice(0, PREVIEW_TRUNCATE_LENGTH)}…` : text;
}

export function parseSort(value: string | null): "latest" | "popular" {
  return value === "popular" ? "popular" : "latest";
}

export function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export function sortAndPaginate(
  items: FeedItem[],
  sort: "latest" | "popular",
  page: number,
): { items: FeedItem[]; hasMore: boolean } {
  const sorted = [...items].sort((a, b) => {
    if (sort === "popular" && a.score !== b.score) return b.score - a.score;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const start = page * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);
  return { items: pageItems, hasMore: sorted.length > start + PAGE_SIZE };
}

function buildVoteMaps<V extends { value: number; userId: string }>(
  votes: V[],
  getItemId: (v: V) => string,
  currentUserId: string | undefined,
): { scoreByItem: Map<string, number>; myVoteByItem: Map<string, number> } {
  const scoreByItem = new Map<string, number>();
  const myVoteByItem = new Map<string, number>();
  for (const v of votes) {
    const id = getItemId(v);
    scoreByItem.set(id, (scoreByItem.get(id) ?? 0) + v.value);
    if (currentUserId && v.userId === currentUserId) {
      myVoteByItem.set(id, v.value);
    }
  }
  return { scoreByItem, myVoteByItem };
}

export async function getFeedItems(opts: {
  sort: "latest" | "popular";
  page: number;
  authorId?: string;
  currentUserId?: string;
}): Promise<{ items: FeedItem[]; hasMore: boolean }> {
  const db = getDb();
  const [posts, postVotes, bugs, bugVotes, features, featureVotes, orgs, orgVotes, users] = await Promise.all([
    db.select().from(post),
    db.select().from(postVote),
    db.select().from(bug),
    db.select().from(bugVote),
    db.select().from(feature),
    db.select().from(featureVote),
    db.select().from(orgUpload),
    db.select().from(orgVote),
    db.select({ id: user.id, username: user.username, blockedAt: user.blockedAt }).from(user),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));

  const postVoteMaps = buildVoteMaps(postVotes, (v) => v.postId, opts.currentUserId);
  const bugVoteMaps = buildVoteMaps(bugVotes, (v) => v.bugId, opts.currentUserId);
  const featureVoteMaps = buildVoteMaps(featureVotes, (v) => v.featureId, opts.currentUserId);
  const orgVoteMaps = buildVoteMaps(orgVotes, (v) => v.orgUploadId, opts.currentUserId);

  const items: FeedItem[] = [];

  function pushIfEligible(entry: {
    id: string;
    type: FeedItem["type"];
    title: string;
    preview: string;
    authorId: string;
    createdAt: Date;
    scoreByItem: Map<string, number>;
    myVoteByItem: Map<string, number>;
  }) {
    if (opts.authorId && entry.authorId !== opts.authorId) return;
    const author = userMap.get(entry.authorId);
    if (author?.blockedAt) return;
    items.push({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      preview: truncate(entry.preview),
      authorId: entry.authorId,
      authorUsername: author?.username ?? null,
      createdAt: entry.createdAt.toISOString(),
      score: entry.scoreByItem.get(entry.id) ?? 0,
      myVote: (entry.myVoteByItem.get(entry.id) ?? 0) as -1 | 0 | 1,
    });
  }

  for (const p of posts) {
    pushIfEligible({
      id: p.id,
      type: "post",
      title: p.title,
      preview: p.body,
      authorId: p.authorId,
      createdAt: p.createdAt,
      scoreByItem: postVoteMaps.scoreByItem,
      myVoteByItem: postVoteMaps.myVoteByItem,
    });
  }
  for (const b of bugs) {
    pushIfEligible({
      id: b.id,
      type: "bug",
      title: b.title,
      preview: b.description,
      authorId: b.authorId,
      createdAt: b.createdAt,
      scoreByItem: bugVoteMaps.scoreByItem,
      myVoteByItem: bugVoteMaps.myVoteByItem,
    });
  }
  for (const f of features) {
    pushIfEligible({
      id: f.id,
      type: "feature",
      title: f.title,
      preview: f.description,
      authorId: f.authorId,
      createdAt: f.createdAt,
      scoreByItem: featureVoteMaps.scoreByItem,
      myVoteByItem: featureVoteMaps.myVoteByItem,
    });
  }
  for (const o of orgs) {
    pushIfEligible({
      id: o.id,
      type: "org",
      title: o.name,
      preview: o.goal,
      authorId: o.uploaderId,
      createdAt: o.createdAt,
      scoreByItem: orgVoteMaps.scoreByItem,
      myVoteByItem: orgVoteMaps.myVoteByItem,
    });
  }

  return sortAndPaginate(items, opts.sort, opts.page);
}
