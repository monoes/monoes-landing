// Monomind catalog counts, resolved at build time from the published npm
// package, so the site states what `monomind init` actually installs.
// Every getter returns null when the data can't be fetched; callers then
// render their text without a number rather than a stale one.

import { fetchJson } from "./releases.ts";

const PACKAGE = "@monoes/monomindcli";
const AGENTS_DIR = "/.claude/agents/";
const FETCH_TIMEOUT_MS = 5000;

/** `monomind init` skips agent files whose frontmatter marks them deprecated. */
export function isDeprecatedAgent(markdown: string): boolean {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return !!frontmatter && /^deprecated:\s*true\s*$/m.test(frontmatter[1]);
}

/** Agent definition files in a package file listing (jsDelivr "flat" paths). */
export function agentFilePaths(files: string[]): string[] {
  return files.filter((f) => f.startsWith(AGENTS_DIR) && f.endsWith(".md") && !/\/readme\.md$/i.test(f));
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "force-cache", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function countInstalledAgents(): Promise<number | null> {
  const latest = (await fetchJson(`https://registry.npmjs.org/${PACKAGE}/latest`)) as { version?: unknown } | null;
  if (typeof latest?.version !== "string") return null;
  const base = `${PACKAGE}@${latest.version}`;

  const listing = (await fetchJson(`https://data.jsdelivr.com/v1/packages/npm/${base}?structure=flat`)) as
    | { files?: { name?: unknown }[] }
    | null;
  const names = (listing?.files ?? []).flatMap((f) => (typeof f.name === "string" ? [f.name] : []));
  const paths = agentFilePaths(names);
  if (!paths.length) return null;

  const texts = await Promise.all(paths.map((p) => fetchText(`https://cdn.jsdelivr.net/npm/${base}${p}`)));
  // A partial count would understate the catalog; show no number instead.
  if (texts.some((t) => t === null)) return null;
  return texts.filter((t) => !isDeprecatedAgent(t as string)).length;
}

let agentCount: Promise<number | null> | undefined;

/** Number of agent definitions `monomind init` installs from the latest release. */
export function getMonomindAgentCount(): Promise<number | null> {
  agentCount ??= countInstalledAgents().catch(() => null);
  return agentCount;
}
