import { getDb, type Db } from "@/lib/db";
import { canDelete, canEdit, canSetVisibility, canView, isAdmin, type Viewer } from "./access";
import {
  checkDescription,
  checkName,
  contentDisposition,
  DESCRIPTION_MAX,
  parseListQuery,
  parseTags,
  type ItemPath,
} from "./http";
import { optionalReader, requireUser } from "./request-auth";
import { bumpPatch, isSemver } from "./semver";
import { GALLERY_ORG_VERSION } from "./serialize";
import {
  addVersion,
  countRecentUploads,
  createItem,
  deleteGalleryOrg,
  deleteItem,
  findItem,
  getArtifact,
  listItems,
  listVersions,
  serialize,
  updateItem,
  type Found,
  type ItemRecord,
} from "./store";
import { isVisibility, LibraryError, MAX_ARTIFACT_BYTES, parseKind, type Kind, type Visibility } from "./types";
import { slugify, validateArtifact } from "./validate";

const UPLOADS_PER_HOUR = 30;
// Multipart framing on top of the largest artifact.
const MAX_UPLOAD_BODY = MAX_ARTIFACT_BYTES.automation + 1024 * 1024;

function origin(request: Request): string {
  return new URL(request.url).origin;
}

function ownerOf(found: Found): { ownerId: string; visibility: Visibility } {
  return found.source === "library"
    ? { ownerId: found.row.ownerId, visibility: found.row.visibility as Visibility }
    : { ownerId: found.row.uploaderId, visibility: "public" };
}

async function findVisible(db: Db, path: ItemPath, viewer: Viewer): Promise<Found> {
  const found = await findItem(db, path.ref);
  if (!found || !canView(ownerOf(found), viewer)) throw new LibraryError(404, "not_found", "No such library item.");
  return found;
}

function libraryOnly(found: Found): ItemRecord {
  if (found.source === "gallery") {
    throw new LibraryError(
      409,
      "gallery_org",
      `This org lives in the community gallery; edit it at /community/orgs/${found.row.slug ?? found.row.id}/edit.`,
    );
  }
  return found.row;
}

async function readUpload(request: Request): Promise<{ form: FormData; bytes: Uint8Array }> {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_UPLOAD_BODY) {
    throw new LibraryError(413, "too_large", `Uploads can be at most ${MAX_ARTIFACT_BYTES.automation} bytes.`);
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new LibraryError(400, "invalid_request", "Send multipart/form-data with a file field.");
  }
  const file = form.get("file");
  if (!(file instanceof Blob)) throw new LibraryError(400, "invalid_request", "file is required.");
  if (file.size > MAX_UPLOAD_BODY) {
    throw new LibraryError(413, "too_large", `Uploads can be at most ${MAX_ARTIFACT_BYTES.automation} bytes.`);
  }
  return { form, bytes: new Uint8Array(await file.arrayBuffer()) };
}

function field(form: FormData, name: string): string | undefined {
  const v = form.get(name);
  return typeof v === "string" ? v : undefined;
}

async function checkRate(db: Db, viewer: NonNullable<Viewer>) {
  if (isAdmin(viewer)) return;
  const n = await countRecentUploads(db, viewer.id, new Date(Date.now() - 60 * 60 * 1000));
  if (n >= UPLOADS_PER_HOUR) {
    throw new LibraryError(429, "rate_limited", `At most ${UPLOADS_PER_HOUR} uploads per hour; try again later.`);
  }
}

/** The version for an upload: the form's, else the artifact's, else `fallback`. */
function pickVersion(kind: Kind, given: string | undefined, fromArtifact: string | null, fallback: string): string {
  const version = given?.trim() || fromArtifact || fallback;
  if (!isSemver(version)) throw new LibraryError(400, "invalid_request", "version must be a semver version like 1.2.0.");
  if (kind === "automation" && fromArtifact && version !== fromArtifact) {
    throw new LibraryError(400, "invalid_request", `version must match automation.json (${fromArtifact}).`);
  }
  return version;
}

export async function handleList(request: Request): Promise<Response> {
  const query = parseListQuery(new URL(request.url).searchParams);
  let viewerId: string | null = null;
  if (query.scope === "mine") viewerId = (await requireUser(request, "library:read")).id;
  const db = getDb();
  const { items, total } = await listItems(db, query, viewerId, origin(request));
  return Response.json({ items, page: query.page, per_page: query.perPage, total });
}

export async function handleCreate(request: Request): Promise<Response> {
  const viewer = await requireUser(request, "library:write");
  const db = getDb();
  const { form, bytes } = await readUpload(request);

  const kind = parseKind(field(form, "kind"));
  if (!kind) throw new LibraryError(400, "invalid_request", "kind must be workflow, automation or org.");
  const visibility = field(form, "visibility") || "private";
  if (!isVisibility(visibility)) throw new LibraryError(400, "invalid_request", "visibility must be private, public or official.");
  if (!canSetVisibility(visibility, viewer)) throw new LibraryError(403, "forbidden", "Only admins publish official items.");
  await checkRate(db, viewer);

  const artifact = await validateArtifact(kind, bytes);
  const name = checkName(field(form, "name") || artifact.name);
  const row = await createItem(db, {
    kind,
    visibility,
    name,
    slugBase: kind === "automation" ? artifact.slug : slugify(name, kind),
    description: checkDescription(field(form, "description") ?? artifact.description.slice(0, DESCRIPTION_MAX)),
    tags: parseTags(field(form, "tags") ?? ""),
    version: pickVersion(kind, field(form, "version"), artifact.version, "1.0.0"),
    ownerId: viewer.id,
    bytes,
    artifact,
  });
  const [item] = await serialize(db, [{ source: "library", row }], origin(request));
  return Response.json(item, { status: 201 });
}

export async function handleGet(request: Request, path: ItemPath): Promise<Response> {
  const viewer = await optionalReader(request);
  const db = getDb();
  const found = await findVisible(db, path, viewer);

  if (path.sub === null) {
    const [item] = await serialize(db, [found], origin(request));
    return Response.json(item);
  }

  const id = found.row.id;
  if (path.sub === "versions") {
    const base = `${origin(request)}/api/library/items/${id}/artifact?version=`;
    if (found.source === "gallery") {
      const a = await getArtifact(db, found);
      return Response.json({
        versions: [{ version: GALLERY_ORG_VERSION, sha256: a!.sha256, size: a!.size, created_at: found.row.createdAt.toISOString(), artifact_url: base + GALLERY_ORG_VERSION }],
      });
    }
    const rows = await listVersions(db, id);
    return Response.json({
      versions: rows.map((v) => ({
        version: v.version,
        sha256: v.sha256,
        size: v.size,
        created_at: v.createdAt.toISOString(),
        artifact_url: base + encodeURIComponent(v.version),
      })),
    });
  }

  const artifact = await getArtifact(db, found, new URL(request.url).searchParams.get("version"));
  if (!artifact) throw new LibraryError(404, "not_found", "No such version.");
  return new Response(artifact.body as BodyInit, {
    headers: {
      "Content-Type": artifact.contentType,
      "Content-Length": String(artifact.size),
      "Content-Disposition": contentDisposition(artifact.filename),
      "X-Content-SHA256": artifact.sha256,
      "X-Library-Version": artifact.version,
      "Cache-Control": "private, no-cache",
    },
  });
}

export async function handleNewVersion(request: Request, path: ItemPath): Promise<Response> {
  if (path.sub !== "artifact") throw new LibraryError(405, "method_not_allowed", "PUT goes to /items/{id}/artifact.");
  const viewer = await requireUser(request, "library:write");
  const db = getDb();
  const item = libraryOnly(await findVisible(db, path, viewer));
  if (!canEdit({ ownerId: item.ownerId, visibility: item.visibility as Visibility }, viewer)) {
    throw new LibraryError(403, "forbidden", "Only the owner can publish a new version.");
  }
  const { form, bytes } = await readUpload(request);
  await checkRate(db, viewer);
  const kind = item.kind as Kind;
  const artifact = await validateArtifact(kind, bytes);
  const version = pickVersion(kind, field(form, "version"), artifact.version, bumpPatch(item.version));
  const row = await addVersion(db, item, { version, bytes, artifact, userId: viewer.id });
  const [out] = await serialize(db, [{ source: "library", row }], origin(request));
  return Response.json(out);
}

export async function handlePatch(request: Request, path: ItemPath): Promise<Response> {
  if (path.sub !== null) throw new LibraryError(405, "method_not_allowed", "PATCH goes to /items/{id}.");
  const viewer = await requireUser(request, "library:write");
  const db = getDb();
  const item = libraryOnly(await findVisible(db, path, viewer));
  if (!canEdit({ ownerId: item.ownerId, visibility: item.visibility as Visibility }, viewer)) {
    throw new LibraryError(403, "forbidden", "Only the owner can edit this item.");
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") throw new LibraryError(400, "invalid_request", "Send a JSON object.");

  const patch: Parameters<typeof updateItem>[2] = {};
  if (body.name !== undefined) patch.name = checkName(String(body.name));
  if (body.description !== undefined) patch.description = checkDescription(String(body.description));
  if (body.tags !== undefined) {
    if (typeof body.tags !== "string" && !(Array.isArray(body.tags) && body.tags.every((t) => typeof t === "string"))) {
      throw new LibraryError(400, "invalid_request", "tags must be a list or a comma-separated string.");
    }
    patch.tags = parseTags(body.tags as string | string[]);
  }
  if (body.visibility !== undefined) {
    if (!isVisibility(body.visibility)) throw new LibraryError(400, "invalid_request", "visibility must be private, public or official.");
    // Moving an item into or out of "official" is an admin decision.
    if (!canSetVisibility(body.visibility, viewer) || !canSetVisibility(item.visibility as Visibility, viewer)) {
      throw new LibraryError(403, "forbidden", "Only admins change official items' visibility.");
    }
    patch.visibility = body.visibility;
  }
  const row = await updateItem(db, item, patch);
  const [out] = await serialize(db, [{ source: "library", row }], origin(request));
  return Response.json(out);
}

export async function handleDelete(request: Request, path: ItemPath): Promise<Response> {
  if (path.sub !== null) throw new LibraryError(405, "method_not_allowed", "DELETE goes to /items/{id}.");
  const viewer = await requireUser(request, "library:write");
  const db = getDb();
  const found = await findItem(db, path.ref);
  if (!found || !canView(ownerOf(found), viewer)) {
    // Admins may delete any item, private ones included.
    if (!found || !isAdmin(viewer)) throw new LibraryError(404, "not_found", "No such library item.");
  }
  if (!canDelete(ownerOf(found), viewer)) throw new LibraryError(403, "forbidden", "Only the owner or an admin can delete this item.");
  if (found.source === "gallery") await deleteGalleryOrg(db, found.row.id);
  else await deleteItem(db, found.row);
  return Response.json({ id: found.row.id, deleted: true });
}
