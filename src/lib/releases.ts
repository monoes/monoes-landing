// Build-time GitHub Releases access. Every fetch uses `cache: "force-cache"` and
// a short timeout, and every failure resolves to null so a network problem can
// never fail the static build.

export type ProductId = "monomind" | "mono-agent" | "mono-clip" | "monotask";

export interface Product {
  id: ProductId;
  name: string;
  repo: string;
}

export const PRODUCTS: readonly Product[] = [
  { id: "monomind", name: "Monomind", repo: "monoes/monomind" },
  { id: "mono-agent", name: "Mono Agent", repo: "monoes/mono-agent" },
  { id: "mono-clip", name: "MonoClip", repo: "monoes/mono-clip" },
  { id: "monotask", name: "MonoTask", repo: "monoes/monotask" },
];

export interface Release {
  tag: string;
  version: string;
  name: string;
  url: string;
  publishedAt: string | null;
  prerelease: boolean;
  body: string;
}

interface GitHubRelease {
  tag_name?: unknown;
  name?: unknown;
  html_url?: unknown;
  published_at?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  body?: unknown;
}

const FETCH_TIMEOUT_MS = 5000;

/** Turns a tag like "v2.16.4" or "MonoClip v0.2.19" into "2.16.4" / "0.2.19". */
export function normalizeVersion(tag: string): string | null {
  const match = tag.trim().match(/v?(\d+(?:\.\d+)+(?:-[0-9A-Za-z.-]+)?)/);
  return match ? match[1] : null;
}

export async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  try {
    const res = await fetch(url, {
      cache: "force-cache",
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    // GitHub rejects API requests without a User-Agent, which Workers do not send by default.
    "User-Agent": "monoes-landing",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function fetchGitHub(path: string): Promise<unknown> {
  return fetchJson(`https://api.github.com${path}`, githubHeaders());
}

export function toRelease(raw: GitHubRelease): Release | null {
  if (typeof raw.tag_name !== "string" || typeof raw.html_url !== "string") return null;
  return {
    tag: raw.tag_name,
    version: normalizeVersion(raw.tag_name) ?? raw.tag_name,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : raw.tag_name,
    url: raw.html_url,
    publishedAt: typeof raw.published_at === "string" ? raw.published_at : null,
    prerelease: raw.prerelease === true,
    body: typeof raw.body === "string" ? raw.body : "",
  };
}

const releasesCache = new Map<string, Promise<Release[] | null>>();

/** Non-draft releases for a repo, newest first, or null if they couldn't be loaded. */
export function getReleases(repo: string): Promise<Release[] | null> {
  let pending = releasesCache.get(repo);
  if (!pending) {
    pending = fetchGitHub(`/repos/${repo}/releases?per_page=30`).then((data) => {
      if (!Array.isArray(data)) return null;
      return (data as GitHubRelease[])
        .filter((r) => r.draft !== true)
        .map(toRelease)
        .filter((r): r is Release => r !== null)
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    });
    releasesCache.set(repo, pending);
  }
  return pending;
}
