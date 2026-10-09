import { count, desc, eq, max, sum } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Db } from "@/lib/db";
import {
  account,
  blogComment,
  bug,
  bugComment,
  bugVote,
  feature,
  featureVote,
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  orgComment,
  orgRun,
  orgRunFile,
  orgUpload,
  orgVote,
  post,
  postVote,
  session,
  user,
} from "@/lib/db/schema";
import { libraryComment, libraryItem, libraryVote } from "@/lib/db/library-schema";
import { KIND_PATH, type Kind } from "@/lib/library/types";
import {
  PROVIDER_LABEL,
  buildActivityTimeline,
  parseStringList,
  summarizeUserAgent,
  type ActivityItem,
  type AdminUserSummary,
  type UserRole,
} from "./admin-users";

// Admin-only reads. Every query selects explicit columns so password hashes,
// OAuth tokens, and session tokens never leave the database.

const TIMELINE_LIMIT = 200;
const PER_SOURCE_LIMIT = 100;
const SESSION_LIMIT = 50;
const PREVIEW_LENGTH = 140;

type Counts = {
  posts: number;
  features: number;
  bugs: number;
  bugComments: number;
  orgUploads: number;
  orgRuns: number;
  orgComments: number;
  blogComments: number;
  libraryItems: number;
  libraryComments: number;
  votes: number;
};

function preview(text: string): string {
  return text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH)}…` : text;
}

function avatarUrl(row: { avatarKey: string | null; image: string | null; updatedAt: Date }): string | null {
  if (row.avatarKey) return `/api/images/avatar/${row.avatarKey}?v=${row.updatedAt.getTime()}`;
  return row.image;
}

async function countByUser(db: Db, table: SQLiteTable, column: SQLiteColumn, userId?: string) {
  const rows = await db
    .select({ userId: column, n: count() })
    .from(table)
    .where(userId ? eq(column, userId) : undefined)
    .groupBy(column);
  return new Map(rows.map((r) => [r.userId as string, r.n]));
}

async function getCounts(db: Db, userId?: string): Promise<(id: string) => Counts> {
  const maps = await Promise.all([
    countByUser(db, post, post.authorId, userId),
    countByUser(db, feature, feature.authorId, userId),
    countByUser(db, bug, bug.authorId, userId),
    countByUser(db, bugComment, bugComment.authorId, userId),
    countByUser(db, orgUpload, orgUpload.uploaderId, userId),
    countByUser(db, orgRun, orgRun.uploaderId, userId),
    countByUser(db, orgComment, orgComment.authorId, userId),
    countByUser(db, blogComment, blogComment.authorId, userId),
    countByUser(db, libraryItem, libraryItem.ownerId, userId),
    countByUser(db, libraryComment, libraryComment.authorId, userId),
    countByUser(db, postVote, postVote.userId, userId),
    countByUser(db, featureVote, featureVote.userId, userId),
    countByUser(db, bugVote, bugVote.userId, userId),
    countByUser(db, orgVote, orgVote.userId, userId),
    countByUser(db, libraryVote, libraryVote.userId, userId),
  ]);
  const [posts, features, bugs, bugComments, orgUploads, orgRuns, orgComments, blogComments, libraryItems, libraryComments, ...votes] =
    maps;
  return (id) => ({
    posts: posts.get(id) ?? 0,
    features: features.get(id) ?? 0,
    bugs: bugs.get(id) ?? 0,
    bugComments: bugComments.get(id) ?? 0,
    orgUploads: orgUploads.get(id) ?? 0,
    orgRuns: orgRuns.get(id) ?? 0,
    orgComments: orgComments.get(id) ?? 0,
    blogComments: blogComments.get(id) ?? 0,
    libraryItems: libraryItems.get(id) ?? 0,
    libraryComments: libraryComments.get(id) ?? 0,
    votes: votes.reduce((total, m) => total + (m.get(id) ?? 0), 0),
  });
}

function contributionTotal(c: Counts): number {
  return (
    c.posts +
    c.features +
    c.bugs +
    c.bugComments +
    c.orgUploads +
    c.orgRuns +
    c.orgComments +
    c.blogComments +
    c.libraryItems +
    c.libraryComments
  );
}

const userColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  username: user.username,
  role: user.role,
  blockedAt: user.blockedAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  image: user.image,
  avatarKey: user.avatarKey,
};

type UserRow = { [K in keyof typeof userColumns]: (typeof user.$inferSelect)[K] };

function toSummary(
  row: UserRow,
  providers: string[],
  sessionInfo: { lastActiveAt: Date | null; n: number } | undefined,
  counts: Counts,
): AdminUserSummary {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    username: row.username,
    role: row.role as UserRole,
    blockedAt: row.blockedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    avatarUrl: avatarUrl(row),
    providers,
    lastActiveAt: sessionInfo?.lastActiveAt?.toISOString() ?? null,
    sessionCount: sessionInfo?.n ?? 0,
    contributionCount: contributionTotal(counts),
    voteCount: counts.votes,
  };
}

export async function getAdminUserSummaries(db: Db): Promise<{ users: AdminUserSummary[]; generatedAt: number }> {
  const [rows, accounts, sessions, countsFor] = await Promise.all([
    db.select(userColumns).from(user).orderBy(desc(user.createdAt)),
    db.select({ userId: account.userId, providerId: account.providerId }).from(account),
    db
      .select({ userId: session.userId, lastActiveAt: max(session.updatedAt), n: count() })
      .from(session)
      .groupBy(session.userId),
    getCounts(db),
  ]);

  const providersByUser = new Map<string, string[]>();
  for (const a of accounts) {
    providersByUser.set(a.userId, [...(providersByUser.get(a.userId) ?? []), a.providerId]);
  }
  const sessionsByUser = new Map(sessions.map((s) => [s.userId, s]));

  return {
    users: rows.map((row) => toSummary(row, providersByUser.get(row.id) ?? [], sessionsByUser.get(row.id), countsFor(row.id))),
    generatedAt: Date.now(),
  };
}

export type AdminUserDetail = {
  profile: AdminUserSummary & {
    updatedAt: string;
    blockedByUsername: string | null;
    tagline: string | null;
    jobTitle: string | null;
    company: string | null;
    tags: string[];
    links: { label: string; url: string }[];
  };
  accounts: { provider: string; linkedAt: string }[];
  sessions: {
    id: string;
    signedInAt: string;
    lastSeenAt: string;
    expiresAt: string;
    ipAddress: string | null;
    device: string;
    userAgent: string | null;
  }[];
  connectedApps: { clientId: string; name: string; scopes: string[]; authorizedAt: string | null; tokensIssued: number; lastTokenAt: string | null }[];
  counts: Counts & { storageBytes: number };
  timeline: ActivityItem[];
};

function voteLabel(value: number, target: string): string {
  return `${value > 0 ? "Upvoted" : "Downvoted"} ${target}`;
}

export async function getAdminUserDetail(db: Db, id: string): Promise<AdminUserDetail | null> {
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (!row) return null;

  const [
    [sessionInfo],
    blockedBy,
    accounts,
    sessions,
    consents,
    tokens,
    countsFor,
    [storage],
    posts,
    postVotes,
    features,
    featureVotes,
    bugs,
    bugComments,
    bugVotes,
    orgs,
    orgVotes,
    orgRuns,
    orgComments,
    blogComments,
    libraryItems,
    libraryComments,
    libraryVotes,
  ] = await Promise.all([
    db.select({ lastActiveAt: max(session.updatedAt), n: count() }).from(session).where(eq(session.userId, id)),
    row.blockedBy
      ? db.select({ username: user.username }).from(user).where(eq(user.id, row.blockedBy)).limit(1)
      : Promise.resolve([]),
    db.select({ providerId: account.providerId, createdAt: account.createdAt }).from(account).where(eq(account.userId, id)),
    db
      .select({
        id: session.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(eq(session.userId, id))
      .orderBy(desc(session.updatedAt))
      .limit(SESSION_LIMIT),
    db
      .select({ clientId: oauthConsent.clientId, scopes: oauthConsent.scopes, createdAt: oauthConsent.createdAt, name: oauthClient.name })
      .from(oauthConsent)
      .leftJoin(oauthClient, eq(oauthConsent.clientId, oauthClient.clientId))
      .where(eq(oauthConsent.userId, id)),
    db
      .select({ clientId: oauthAccessToken.clientId, name: oauthClient.name, n: count(), lastTokenAt: max(oauthAccessToken.createdAt) })
      .from(oauthAccessToken)
      .leftJoin(oauthClient, eq(oauthAccessToken.clientId, oauthClient.clientId))
      .where(eq(oauthAccessToken.userId, id))
      .groupBy(oauthAccessToken.clientId, oauthClient.name),
    getCounts(db, id),
    db
      .select({ bytes: sum(orgRunFile.sizeBytes) })
      .from(orgRunFile)
      .innerJoin(orgRun, eq(orgRunFile.orgRunId, orgRun.id))
      .where(eq(orgRun.uploaderId, id)),
    db.select({ id: post.id, title: post.title, createdAt: post.createdAt }).from(post).where(eq(post.authorId, id)).orderBy(desc(post.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ id: post.id, title: post.title, value: postVote.value, createdAt: postVote.createdAt }).from(postVote).innerJoin(post, eq(postVote.postId, post.id)).where(eq(postVote.userId, id)).orderBy(desc(postVote.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ title: feature.title, status: feature.status, createdAt: feature.createdAt }).from(feature).where(eq(feature.authorId, id)).orderBy(desc(feature.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ title: feature.title, value: featureVote.value, createdAt: featureVote.createdAt }).from(featureVote).innerJoin(feature, eq(featureVote.featureId, feature.id)).where(eq(featureVote.userId, id)).orderBy(desc(featureVote.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ id: bug.id, title: bug.title, severity: bug.severity, createdAt: bug.createdAt }).from(bug).where(eq(bug.authorId, id)).orderBy(desc(bug.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ bugId: bug.id, title: bug.title, body: bugComment.body, createdAt: bugComment.createdAt }).from(bugComment).innerJoin(bug, eq(bugComment.bugId, bug.id)).where(eq(bugComment.authorId, id)).orderBy(desc(bugComment.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ id: bug.id, title: bug.title, value: bugVote.value, createdAt: bugVote.createdAt }).from(bugVote).innerJoin(bug, eq(bugVote.bugId, bug.id)).where(eq(bugVote.userId, id)).orderBy(desc(bugVote.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ id: orgUpload.id, name: orgUpload.name, roleCount: orgUpload.roleCount, createdAt: orgUpload.createdAt }).from(orgUpload).where(eq(orgUpload.uploaderId, id)).orderBy(desc(orgUpload.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ id: orgUpload.id, name: orgUpload.name, value: orgVote.value, createdAt: orgVote.createdAt }).from(orgVote).innerJoin(orgUpload, eq(orgVote.orgUploadId, orgUpload.id)).where(eq(orgVote.userId, id)).orderBy(desc(orgVote.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ orgId: orgUpload.id, name: orgUpload.name, label: orgRun.label, createdAt: orgRun.createdAt }).from(orgRun).innerJoin(orgUpload, eq(orgRun.orgUploadId, orgUpload.id)).where(eq(orgRun.uploaderId, id)).orderBy(desc(orgRun.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ orgId: orgUpload.id, name: orgUpload.name, body: orgComment.body, createdAt: orgComment.createdAt }).from(orgComment).innerJoin(orgUpload, eq(orgComment.orgUploadId, orgUpload.id)).where(eq(orgComment.authorId, id)).orderBy(desc(orgComment.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ postSlug: blogComment.postSlug, body: blogComment.body, createdAt: blogComment.createdAt }).from(blogComment).where(eq(blogComment.authorId, id)).orderBy(desc(blogComment.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ kind: libraryItem.kind, slug: libraryItem.slug, name: libraryItem.name, visibility: libraryItem.visibility, createdAt: libraryItem.createdAt }).from(libraryItem).where(eq(libraryItem.ownerId, id)).orderBy(desc(libraryItem.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ kind: libraryItem.kind, slug: libraryItem.slug, name: libraryItem.name, body: libraryComment.body, createdAt: libraryComment.createdAt }).from(libraryComment).innerJoin(libraryItem, eq(libraryComment.itemId, libraryItem.id)).where(eq(libraryComment.authorId, id)).orderBy(desc(libraryComment.createdAt)).limit(PER_SOURCE_LIMIT),
    db.select({ kind: libraryItem.kind, slug: libraryItem.slug, name: libraryItem.name, value: libraryVote.value, createdAt: libraryVote.createdAt }).from(libraryVote).innerJoin(libraryItem, eq(libraryVote.itemId, libraryItem.id)).where(eq(libraryVote.userId, id)).orderBy(desc(libraryVote.createdAt)).limit(PER_SOURCE_LIMIT),
  ]);
  const libraryHref = (r: { kind: string; slug: string }) => `/library/${KIND_PATH[r.kind as Kind]}/${r.slug}`;

  const tokensByClient = new Map(tokens.map((t) => [t.clientId, t]));
  const clientIds = new Set([...consents.map((c) => c.clientId), ...tokens.map((t) => t.clientId)]);
  const connectedApps = [...clientIds].map((clientId) => {
    const consent = consents.find((c) => c.clientId === clientId);
    const tokenInfo = tokensByClient.get(clientId);
    return {
      clientId,
      name: consent?.name ?? tokenInfo?.name ?? clientId,
      scopes: parseStringList(consent?.scopes),
      authorizedAt: consent?.createdAt?.toISOString() ?? null,
      tokensIssued: tokenInfo?.n ?? 0,
      lastTokenAt: tokenInfo?.lastTokenAt?.toISOString() ?? null,
    };
  });

  const counts = countsFor(id);
  const at = (d: Date) => d.toISOString();
  const timeline = buildActivityTimeline(
    [
      { kind: "signup", label: "Created account", detail: null, href: null, at: at(row.createdAt) },
      ...accounts.map((a): ActivityItem => ({ kind: "account_linked", label: `Added ${PROVIDER_LABEL[a.providerId] ?? a.providerId} sign-in`, detail: null, href: null, at: at(a.createdAt) })),
      ...sessions.map((s): ActivityItem => ({ kind: "sign_in", label: "Signed in", detail: [summarizeUserAgent(s.userAgent), s.ipAddress].filter(Boolean).join(" · "), href: null, at: at(s.createdAt) })),
      ...connectedApps.filter((a) => a.authorizedAt).map((a): ActivityItem => ({ kind: "app_authorized", label: `Authorized ${a.name}`, detail: a.scopes.join(", ") || null, href: null, at: a.authorizedAt as string })),
      ...posts.map((p): ActivityItem => ({ kind: "post", label: `Posted "${p.title}"`, detail: null, href: `/community/posts/${p.id}`, at: at(p.createdAt) })),
      ...postVotes.map((v): ActivityItem => ({ kind: "vote", label: voteLabel(v.value, `post "${v.title}"`), detail: null, href: `/community/posts/${v.id}`, at: at(v.createdAt) })),
      ...features.map((f): ActivityItem => ({ kind: "feature", label: `Requested feature "${f.title}"`, detail: `Status: ${f.status}`, href: "/community/features", at: at(f.createdAt) })),
      ...featureVotes.map((v): ActivityItem => ({ kind: "vote", label: voteLabel(v.value, `feature "${v.title}"`), detail: null, href: "/community/features", at: at(v.createdAt) })),
      ...bugs.map((b): ActivityItem => ({ kind: "bug", label: `Reported bug "${b.title}"`, detail: `Severity: ${b.severity}`, href: `/community/bugs/${b.id}`, at: at(b.createdAt) })),
      ...bugComments.map((c): ActivityItem => ({ kind: "bug_comment", label: `Commented on bug "${c.title}"`, detail: preview(c.body), href: `/community/bugs/${c.bugId}`, at: at(c.createdAt) })),
      ...bugVotes.map((v): ActivityItem => ({ kind: "vote", label: voteLabel(v.value, `bug "${v.title}"`), detail: null, href: `/community/bugs/${v.id}`, at: at(v.createdAt) })),
      ...orgs.map((o): ActivityItem => ({ kind: "org_upload", label: `Uploaded org "${o.name}"`, detail: `${o.roleCount} roles`, href: `/community/orgs/${o.id}`, at: at(o.createdAt) })),
      ...orgVotes.map((v): ActivityItem => ({ kind: "vote", label: voteLabel(v.value, `org "${v.name}"`), detail: null, href: `/community/orgs/${v.id}`, at: at(v.createdAt) })),
      ...orgRuns.map((r): ActivityItem => ({ kind: "org_run", label: `Uploaded a run for org "${r.name}"`, detail: r.label, href: `/community/orgs/${r.orgId}`, at: at(r.createdAt) })),
      ...orgComments.map((c): ActivityItem => ({ kind: "org_comment", label: `Commented on org "${c.name}"`, detail: preview(c.body), href: `/community/orgs/${c.orgId}`, at: at(c.createdAt) })),
      ...blogComments.map((c): ActivityItem => ({ kind: "blog_comment", label: `Commented on blog post "${c.postSlug}"`, detail: preview(c.body), href: `/blog/${c.postSlug}`, at: at(c.createdAt) })),
      ...libraryItems.map((l): ActivityItem => ({ kind: "library_item", label: `Published ${l.kind} "${l.name}" to the library`, detail: `Visibility: ${l.visibility}`, href: libraryHref(l), at: at(l.createdAt) })),
      ...libraryComments.map((c): ActivityItem => ({ kind: "library_comment", label: `Commented on ${c.kind} "${c.name}"`, detail: preview(c.body), href: libraryHref(c), at: at(c.createdAt) })),
      ...libraryVotes.map((v): ActivityItem => ({ kind: "vote", label: voteLabel(v.value, `${v.kind} "${v.name}"`), detail: null, href: libraryHref(v), at: at(v.createdAt) })),
    ],
    TIMELINE_LIMIT,
  );

  const links = [
    { label: "Website", url: row.websiteUrl },
    { label: "GitHub", url: row.githubUrl },
    { label: "X / Twitter", url: row.twitterUrl },
    { label: "LinkedIn", url: row.linkedinUrl },
  ].filter((l): l is { label: string; url: string } => !!l.url);

  return {
    profile: {
      ...toSummary(row, accounts.map((a) => a.providerId), sessionInfo, counts),
      updatedAt: at(row.updatedAt),
      blockedByUsername: blockedBy[0]?.username ?? null,
      tagline: row.tagline,
      jobTitle: row.jobTitle,
      company: row.company,
      tags: parseStringList(row.tagsJson),
      links,
    },
    accounts: accounts.map((a) => ({ provider: PROVIDER_LABEL[a.providerId] ?? a.providerId, linkedAt: at(a.createdAt) })),
    sessions: sessions.map((s) => ({
      id: s.id,
      signedInAt: at(s.createdAt),
      lastSeenAt: at(s.updatedAt),
      expiresAt: at(s.expiresAt),
      ipAddress: s.ipAddress,
      device: summarizeUserAgent(s.userAgent),
      userAgent: s.userAgent,
    })),
    connectedApps,
    counts: { ...counts, storageBytes: Number(storage?.bytes ?? 0) },
    timeline,
  };
}
