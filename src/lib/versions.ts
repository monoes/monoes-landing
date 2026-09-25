// Latest product versions, resolved at build time. Each getter returns null when
// the version can't be fetched; callers render their text without a version.

import { fetchGitHub, fetchJson, normalizeVersion } from "@/lib/releases";

const memo = new Map<string, Promise<string | null>>();

function memoize(key: string, load: () => Promise<string | null>): Promise<string | null> {
  let pending = memo.get(key);
  if (!pending) {
    pending = load().catch(() => null);
    memo.set(key, pending);
  }
  return pending;
}

function latestGitHubVersion(repo: string): Promise<string | null> {
  return memoize(repo, async () => {
    const data = await fetchGitHub(`/repos/${repo}/releases/latest`);
    const tag = (data as { tag_name?: unknown } | null)?.tag_name;
    return typeof tag === "string" ? normalizeVersion(tag) : null;
  });
}

export function getMonomindVersion(): Promise<string | null> {
  return memoize("npm:monomind", async () => {
    const data = await fetchJson("https://registry.npmjs.org/monomind/latest");
    const version = (data as { version?: unknown } | null)?.version;
    return typeof version === "string" ? normalizeVersion(version) : null;
  });
}

export function getMonoAgentVersion(): Promise<string | null> {
  return latestGitHubVersion("monoes/mono-agent");
}

export function getMonoClipVersion(): Promise<string | null> {
  return latestGitHubVersion("monoes/mono-clip");
}

export function getMonotaskVersion(): Promise<string | null> {
  return latestGitHubVersion("monoes/monotask");
}
