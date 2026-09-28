export const KINDS = ["workflow", "automation", "org"] as const;
export type Kind = (typeof KINDS)[number];

export const VISIBILITIES = ["private", "public", "official"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const SCOPES = ["public", "official", "mine"] as const;
export type ListScope = (typeof SCOPES)[number];

/** URL segment for each kind: /library/<segment>/<slug>. */
export const KIND_PATH: Record<Kind, string> = {
  workflow: "workflows",
  automation: "automations",
  org: "orgs",
};

export const KIND_LABEL: Record<Kind, string> = {
  workflow: "Workflow",
  automation: "Web automation",
  org: "Org",
};

export const CONTENT_TYPE: Record<Kind, string> = {
  workflow: "application/json",
  automation: "application/zip",
  org: "application/json",
};

export const MAX_ARTIFACT_BYTES: Record<Kind, number> = {
  workflow: 20 * 1024 * 1024,
  automation: 20 * 1024 * 1024,
  // Same limit as the /community/orgs gallery upload.
  org: 500_000,
};

/** Accepts the singular kind ("automation") or its URL segment ("automations"). */
export function parseKind(value: string | null | undefined): Kind | null {
  if (!value) return null;
  const v = value.toLowerCase();
  for (const kind of KINDS) {
    if (v === kind || v === KIND_PATH[kind]) return kind;
  }
  return null;
}

export function isVisibility(value: unknown): value is Visibility {
  return typeof value === "string" && (VISIBILITIES as readonly string[]).includes(value);
}

export type ItemOwner = { id: string; username: string | null; name: string };

/** The `Item` object of the library HTTP API (SPEC.md). */
export interface LibraryItem {
  id: string;
  kind: Kind;
  slug: string;
  name: string;
  description: string;
  version: string;
  visibility: Visibility;
  tags: string[];
  owner: ItemOwner;
  sha256: string;
  size: number;
  meta: Record<string, unknown>;
  /** Net community votes (up minus down). */
  score: number;
  created_at: string;
  updated_at: string;
  url: string;
  artifact_url: string;
}

export interface LibraryVersionInfo {
  version: string;
  sha256: string;
  size: number;
  created_at: string;
  artifact_url: string;
}

/** An error the API turns into `{error: {code, message}}` with `status`. */
export class LibraryError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
