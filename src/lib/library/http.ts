import { LibraryError, parseKind, SCOPES, type Kind, type ListScope } from "./types.ts";

export const MAX_PER_PAGE = 100;
export const DEFAULT_PER_PAGE = 24;
export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 2000;
export const MAX_TAGS = 10;
const TAG = /^[a-z0-9][a-z0-9-]{0,31}$/;

export function apiError(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

export function errorResponse(err: unknown): Response {
  if (err instanceof LibraryError) return apiError(err.status, err.code, err.message);
  console.error("library API error", err);
  return apiError(500, "internal", "Something went wrong.");
}

export interface ListQuery {
  kind: Kind | null;
  scope: ListScope;
  q: string;
  tag: string | null;
  page: number;
  perPage: number;
  sort: "latest" | "popular";
}

function positiveInt(value: string | null, name: string, fallback: number): number {
  if (value === null || value === "") return fallback;
  if (!/^\d+$/.test(value) || Number(value) < 1) {
    throw new LibraryError(400, "invalid_request", `${name} must be a positive integer.`);
  }
  return Number(value);
}

export function parseListQuery(params: URLSearchParams): ListQuery {
  const rawKind = params.get("kind");
  const kind = parseKind(rawKind);
  if (rawKind && !kind) throw new LibraryError(400, "invalid_request", "kind must be workflow, automation or org.");
  const scope = (params.get("scope") || "public") as ListScope;
  if (!SCOPES.includes(scope)) throw new LibraryError(400, "invalid_request", "scope must be public, official or mine.");
  const perPage = positiveInt(params.get("per_page"), "per_page", DEFAULT_PER_PAGE);
  if (perPage > MAX_PER_PAGE) throw new LibraryError(400, "invalid_request", `per_page can be at most ${MAX_PER_PAGE}.`);
  const tag = params.get("tag")?.trim().toLowerCase() || null;
  const sort = params.get("sort") || "latest";
  if (sort !== "latest" && sort !== "popular") {
    throw new LibraryError(400, "invalid_request", "sort must be latest or popular.");
  }
  return {
    kind,
    scope,
    q: (params.get("q") ?? "").trim().slice(0, 100),
    tag,
    page: positiveInt(params.get("page"), "page", 1),
    perPage,
    sort,
  };
}

/** "Social, scraping ,social" → ["social", "scraping"]; 400 on a malformed tag. */
export function parseTags(value: string | string[]): string[] {
  const parts = (Array.isArray(value) ? value : value.split(","))
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const tags = [...new Set(parts)];
  if (tags.length > MAX_TAGS) throw new LibraryError(400, "invalid_request", `At most ${MAX_TAGS} tags.`);
  for (const t of tags) {
    if (!TAG.test(t)) {
      throw new LibraryError(400, "invalid_request", `Tag "${t}": use lowercase letters, digits and '-', up to 32 characters.`);
    }
  }
  return tags;
}

export function checkName(value: string): string {
  const name = value.trim();
  if (!name || name.length > NAME_MAX) {
    throw new LibraryError(400, "invalid_request", `name must be 1–${NAME_MAX} characters.`);
  }
  return name;
}

export function checkDescription(value: string): string {
  if (value.length > DESCRIPTION_MAX) {
    throw new LibraryError(400, "invalid_request", `description can be at most ${DESCRIPTION_MAX} characters.`);
  }
  return value.trim();
}

/** RFC 6266 attachment header with an ASCII fallback. */
export function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export type ItemPath = { ref: { id: string } | { kind: Kind; slug: string }; sub: "artifact" | "versions" | null };

/** [id] | [id, sub] | [kind, slug] | [kind, slug, sub]; null for anything else. */
export function parseItemPath(segments: string[]): ItemPath | null {
  const subOf = (s: string | undefined) => (s === "artifact" || s === "versions" ? s : null);
  const kind = parseKind(segments[0]);
  if (kind && segments.length >= 2) {
    if (segments.length > 3 || (segments.length === 3 && !subOf(segments[2]))) return null;
    return { ref: { kind, slug: segments[1] }, sub: subOf(segments[2]) };
  }
  if (segments.length > 2 || (segments.length === 2 && !subOf(segments[1]))) return null;
  return { ref: { id: segments[0] }, sub: subOf(segments[1]) };
}
