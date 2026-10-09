import { and, count, desc, eq, gt, inArray, like, or, type SQL } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Db } from "@/lib/db";
import { orgUpload, user } from "@/lib/db/schema";
import { libraryItem, libraryVersion } from "@/lib/db/library-schema";
import { uniqueSlug } from "@/lib/community/org-listing";
import { galleryOrgToApiItem, toApiItem, byScoreDesc, byUpdatedDesc, type GalleryOrgRow, type ItemRow } from "./serialize";
import { voteSummaries } from "./community-store";
import { sha256Hex, type ValidatedArtifact } from "./validate";
import { compareSemver } from "./semver";
import type { ListQuery } from "./http";
import { LibraryError, type ItemOwner, type Kind, type LibraryItem, type Visibility } from "./types";

// Library artifacts share the org-files bucket under this prefix, so the
// feature needs no new Cloudflare resource.
const R2_PREFIX = "library";
// Merged (library + gallery) listings page in memory; this bounds the depth.
const MAX_MERGED_WINDOW = 5000;

export type ItemRecord = typeof libraryItem.$inferSelect;
export type Found = { source: "library"; row: ItemRecord } | { source: "gallery"; row: GalleryOrgRow };

// Timestamp columns store whole seconds; match that so a create response
// equals what later reads return.
function nowSeconds(): Date {
  return new Date(Math.floor(Date.now() / 1000) * 1000);
}

function bucket(): CloudflareEnv["ORG_FILES"] {
  return getCloudflareContext().env.ORG_FILES;
}

const galleryColumns = {
  id: orgUpload.id,
  slug: orgUpload.slug,
  name: orgUpload.name,
  goal: orgUpload.goal,
  tagline: orgUpload.tagline,
  description: orgUpload.description,
  topology: orgUpload.topology,
  roleCount: orgUpload.roleCount,
  orgJson: orgUpload.orgJson,
  uploaderId: orgUpload.uploaderId,
  createdAt: orgUpload.createdAt,
};

async function ownersById(db: Db, ids: string[]): Promise<Map<string, ItemOwner>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();
  const rows = await db
    .select({ id: user.id, username: user.username, name: user.name })
    .from(user)
    .where(inArray(user.id, unique));
  return new Map(rows.map((r) => [r.id, r]));
}

async function galleryArtifact(row: GalleryOrgRow) {
  const bytes = new TextEncoder().encode(row.orgJson);
  return { bytes, sha256: await sha256Hex(bytes), size: bytes.byteLength };
}

export async function serialize(db: Db, found: Found[], origin: string): Promise<LibraryItem[]> {
  const [owners, votes] = await Promise.all([
    ownersById(
      db,
      found.map((f) => (f.source === "library" ? f.row.ownerId : f.row.uploaderId)),
    ),
    voteSummaries(
      db,
      found.map((f) => ({ id: f.row.id, source: f.source })),
      null,
    ),
  ]);
  return Promise.all(
    found.map(async (f) => {
      const score = votes.get(f.row.id)?.score ?? 0;
      if (f.source === "library") return toApiItem(f.row as ItemRow, owners.get(f.row.ownerId), origin, score);
      return galleryOrgToApiItem(f.row, owners.get(f.row.uploaderId), await galleryArtifact(f.row), origin, score);
    }),
  );
}

function likeText(q: string): string {
  return `%${q.replace(/[%_]/g, "")}%`;
}

function libraryWhere(query: ListQuery, viewerId: string | null): SQL | undefined {
  const conds: (SQL | undefined)[] = [];
  if (query.kind) conds.push(eq(libraryItem.kind, query.kind));
  if (query.scope === "official") conds.push(eq(libraryItem.visibility, "official"));
  else if (query.scope === "public") conds.push(inArray(libraryItem.visibility, ["public", "official"]));
  else conds.push(eq(libraryItem.ownerId, viewerId ?? ""));
  if (query.q) {
    const text = likeText(query.q);
    conds.push(or(like(libraryItem.name, text), like(libraryItem.description, text), like(libraryItem.slug, text)));
  }
  if (query.tag) conds.push(like(libraryItem.tagsJson, `%"${query.tag.replace(/[^a-z0-9-]/g, "")}"%`));
  return and(...conds);
}

/** Gallery orgs are public, untagged, never official. Null when they can't match. */
function galleryWhere(query: ListQuery, viewerId: string | null): SQL | undefined | null {
  if (query.kind && query.kind !== "org") return null;
  if (query.tag || query.scope === "official") return null;
  const conds: (SQL | undefined)[] = [];
  if (query.scope === "mine") conds.push(eq(orgUpload.uploaderId, viewerId ?? ""));
  if (query.q) {
    const text = likeText(query.q);
    conds.push(or(like(orgUpload.name, text), like(orgUpload.goal, text), like(orgUpload.tagline, text), like(orgUpload.slug, text)));
  }
  return and(...conds);
}

export async function listItems(db: Db, query: ListQuery, viewerId: string | null, origin: string) {
  const libWhere = libraryWhere(query, viewerId);
  const galWhere = galleryWhere(query, viewerId);
  const offset = (query.page - 1) * query.perPage;

  const [libTotal, galTotal] = await Promise.all([
    db.select({ n: count() }).from(libraryItem).where(libWhere),
    galWhere === null ? Promise.resolve([{ n: 0 }]) : db.select({ n: count() }).from(orgUpload).where(galWhere),
  ]);
  const total = libTotal[0].n + galTotal[0].n;

  // Popular: rank everything that matches by score in memory (bounded).
  if (query.sort === "popular") {
    if (total > MAX_MERGED_WINDOW) {
      throw new LibraryError(400, "invalid_request", "Too many matches to rank; narrow the query with kind or q.");
    }
    const [libRows, galRows] = await Promise.all([
      db.select().from(libraryItem).where(libWhere),
      galWhere === null ? Promise.resolve([]) : db.select(galleryColumns).from(orgUpload).where(galWhere),
    ]);
    const all = await serialize(
      db,
      [
        ...libRows.map((row) => ({ source: "library" as const, row })),
        ...galRows.map((row) => ({ source: "gallery" as const, row })),
      ],
      origin,
    );
    return { items: all.sort(byScoreDesc).slice(offset, offset + query.perPage), total };
  }

  let found: Found[];
  if (galWhere === null || galTotal[0].n === 0) {
    const rows = await db
      .select()
      .from(libraryItem)
      .where(libWhere)
      .orderBy(desc(libraryItem.updatedAt), libraryItem.id)
      .limit(query.perPage)
      .offset(offset);
    found = rows.map((row) => ({ source: "library", row }));
  } else {
    const window = offset + query.perPage;
    if (window > MAX_MERGED_WINDOW) {
      throw new LibraryError(400, "invalid_request", "page is too deep; narrow the query with kind or q.");
    }
    const [libRows, galRows] = await Promise.all([
      db.select().from(libraryItem).where(libWhere).orderBy(desc(libraryItem.updatedAt), libraryItem.id).limit(window),
      db.select(galleryColumns).from(orgUpload).where(galWhere).orderBy(desc(orgUpload.createdAt), orgUpload.id).limit(window),
    ]);
    found = [
      ...libRows.map((row) => ({ source: "library" as const, row })),
      ...galRows.map((row) => ({ source: "gallery" as const, row })),
    ];
  }

  const items = (await serialize(db, found, origin)).sort(byUpdatedDesc);
  const pageItems = galWhere === null || galTotal[0].n === 0 ? items : items.slice(offset, offset + query.perPage);
  return { items: pageItems, total };
}

export async function findItem(db: Db, ref: { id: string } | { kind: Kind; slug: string }): Promise<Found | null> {
  if ("id" in ref) {
    const [row] = await db.select().from(libraryItem).where(eq(libraryItem.id, ref.id)).limit(1);
    if (row) return { source: "library", row };
    const [org] = await db.select(galleryColumns).from(orgUpload).where(eq(orgUpload.id, ref.id)).limit(1);
    return org ? { source: "gallery", row: org } : null;
  }
  const [row] = await db
    .select()
    .from(libraryItem)
    .where(and(eq(libraryItem.kind, ref.kind), eq(libraryItem.slug, ref.slug)))
    .limit(1);
  if (row) return { source: "library", row };
  if (ref.kind !== "org") return null;
  const [org] = await db
    .select(galleryColumns)
    .from(orgUpload)
    .where(or(eq(orgUpload.slug, ref.slug), eq(orgUpload.id, ref.slug)))
    .limit(1);
  return org ? { source: "gallery", row: org } : null;
}

async function freeSlug(db: Db, kind: Kind, base: string): Promise<string> {
  const pattern = `${base.replace(/[%_]/g, "")}%`;
  const taken = (
    await db
      .select({ slug: libraryItem.slug })
      .from(libraryItem)
      .where(and(eq(libraryItem.kind, kind), like(libraryItem.slug, pattern)))
  ).map((r) => r.slug);
  if (kind === "org") {
    const gallery = await db.select({ slug: orgUpload.slug }).from(orgUpload).where(like(orgUpload.slug, pattern));
    taken.push(...gallery.flatMap((r) => (r.slug ? [r.slug] : [])));
  }
  return uniqueSlug(base, taken);
}

export async function countRecentUploads(db: Db, userId: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(libraryVersion)
    .where(and(eq(libraryVersion.createdBy, userId), gt(libraryVersion.createdAt, since)));
  return row.n;
}

async function putArtifact(itemId: string, versionId: string, bytes: Uint8Array, artifact: ValidatedArtifact, sha256: string) {
  const key = `${R2_PREFIX}/${itemId}/${versionId}`;
  await bucket().put(key, bytes, {
    httpMetadata: { contentType: artifact.contentType },
    customMetadata: { sha256 },
  });
  return key;
}

export interface NewItem {
  kind: Kind;
  visibility: Visibility;
  name: string;
  slugBase: string;
  description: string;
  tags: string[];
  version: string;
  ownerId: string;
  bytes: Uint8Array;
  artifact: ValidatedArtifact;
}

export async function createItem(db: Db, input: NewItem): Promise<ItemRecord> {
  const itemId = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const sha256 = await sha256Hex(input.bytes);
  const r2Key = await putArtifact(itemId, versionId, input.bytes, input.artifact, sha256);
  const now = nowSeconds();
  const metaJson = JSON.stringify(input.artifact.meta);
  const row: ItemRecord = {
    id: itemId,
    kind: input.kind,
    slug: await freeSlug(db, input.kind, input.slugBase),
    name: input.name,
    description: input.description,
    visibility: input.visibility,
    tagsJson: JSON.stringify(input.tags),
    ownerId: input.ownerId,
    currentVersionId: versionId,
    version: input.version,
    sha256,
    size: input.bytes.byteLength,
    metaJson,
    createdAt: now,
    updatedAt: now,
  };
  const version = {
    id: versionId,
    itemId,
    version: input.version,
    sha256,
    size: input.bytes.byteLength,
    contentType: input.artifact.contentType,
    filename: input.artifact.filename,
    r2Key,
    metaJson,
    createdBy: input.ownerId,
    createdAt: now,
  };
  const insert = (r: ItemRecord) => db.batch([db.insert(libraryItem).values(r), db.insert(libraryVersion).values(version)]);
  try {
    await insert(row);
  } catch {
    // Another upload took the slug between freeSlug and the insert.
    row.slug = `${row.slug}-${itemId.slice(0, 6)}`;
    try {
      await insert(row);
    } catch (err) {
      await bucket().delete(r2Key);
      throw err;
    }
  }
  return row;
}

export async function addVersion(
  db: Db,
  item: ItemRecord,
  input: { version: string; bytes: Uint8Array; artifact: ValidatedArtifact; userId: string },
): Promise<ItemRecord> {
  if (compareSemver(input.version, item.version) <= 0) {
    throw new LibraryError(409, "version_conflict", `version must be newer than the current ${item.version}.`);
  }
  if (item.kind === "automation") {
    const current = JSON.parse(item.metaJson) as { automation_id?: string };
    if (current.automation_id && current.automation_id !== input.artifact.meta.automation_id) {
      throw new LibraryError(400, "invalid_artifact", `This item is automation "${current.automation_id}"; the upload is "${input.artifact.meta.automation_id}".`);
    }
  }
  const versionId = crypto.randomUUID();
  const sha256 = await sha256Hex(input.bytes);
  const r2Key = await putArtifact(item.id, versionId, input.bytes, input.artifact, sha256);
  const now = nowSeconds();
  const metaJson = JSON.stringify(input.artifact.meta);
  const updated: ItemRecord = {
    ...item,
    currentVersionId: versionId,
    version: input.version,
    sha256,
    size: input.bytes.byteLength,
    metaJson,
    updatedAt: now,
  };
  try {
    await db.batch([
      db.insert(libraryVersion).values({
        id: versionId,
        itemId: item.id,
        version: input.version,
        sha256,
        size: input.bytes.byteLength,
        contentType: input.artifact.contentType,
        filename: input.artifact.filename,
        r2Key,
        metaJson,
        createdBy: input.userId,
        createdAt: now,
      }),
      db
        .update(libraryItem)
        .set({ currentVersionId: versionId, version: input.version, sha256, size: updated.size, metaJson, updatedAt: now })
        .where(eq(libraryItem.id, item.id)),
    ]);
  } catch (err) {
    await bucket().delete(r2Key);
    if (String(err).includes("UNIQUE")) throw new LibraryError(409, "version_conflict", `version ${input.version} already exists.`);
    throw err;
  }
  return updated;
}

export async function updateItem(
  db: Db,
  item: ItemRecord,
  patch: { name?: string; description?: string; tags?: string[]; visibility?: Visibility },
): Promise<ItemRecord> {
  const set = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.description !== undefined ? { description: patch.description } : {}),
    ...(patch.tags !== undefined ? { tagsJson: JSON.stringify(patch.tags) } : {}),
    ...(patch.visibility !== undefined ? { visibility: patch.visibility } : {}),
    updatedAt: nowSeconds(),
  };
  await db.update(libraryItem).set(set).where(eq(libraryItem.id, item.id));
  return { ...item, ...set };
}

export async function deleteItem(db: Db, item: ItemRecord): Promise<void> {
  const versions = await db.select({ r2Key: libraryVersion.r2Key }).from(libraryVersion).where(eq(libraryVersion.itemId, item.id));
  await db.batch([
    db.delete(libraryVersion).where(eq(libraryVersion.itemId, item.id)),
    db.delete(libraryItem).where(eq(libraryItem.id, item.id)),
  ]);
  if (versions.length) await bucket().delete(versions.map((v) => v.r2Key));
}

/** Same as DELETE /api/community/orgs/{id}. */
export async function deleteGalleryOrg(db: Db, id: string): Promise<void> {
  await db.delete(orgUpload).where(eq(orgUpload.id, id));
}

/** Newest version first. */
export async function listVersions(db: Db, itemId: string) {
  const rows = await db.select().from(libraryVersion).where(eq(libraryVersion.itemId, itemId));
  return rows.sort((a, b) => compareSemver(b.version, a.version));
}

export interface Artifact {
  body: Uint8Array;
  contentType: string;
  filename: string;
  sha256: string;
  size: number;
  version: string;
}

/** The current artifact, or the one of `version`; null when that version doesn't exist. */
export async function getArtifact(db: Db, found: Found, version?: string | null): Promise<Artifact | null> {
  if (found.source === "gallery") {
    if (version && version !== "1.0.0") return null;
    const a = await galleryArtifact(found.row);
    const filename = `${found.row.slug ?? found.row.id}.json`;
    return { body: a.bytes, contentType: "application/json", filename, sha256: a.sha256, size: a.size, version: "1.0.0" };
  }
  const where = version
    ? and(eq(libraryVersion.itemId, found.row.id), eq(libraryVersion.version, version))
    : eq(libraryVersion.id, found.row.currentVersionId);
  const [row] = await db.select().from(libraryVersion).where(where).limit(1);
  if (!row) return null;
  const object = await bucket().get(row.r2Key);
  if (!object) throw new LibraryError(500, "artifact_missing", "The artifact file is missing from storage.");
  const body = new Uint8Array(await object.arrayBuffer());
  return { body, contentType: row.contentType, filename: row.filename, sha256: row.sha256, size: row.size, version: row.version };
}
