import type { OrgDef } from "@/lib/org-schema";

export const TAGLINE_MAX = 150;
export const DESCRIPTION_MAX = 1000;
export const BODY_MAX = 20000;

export interface OrgListing {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  body: string;
}

/** "monomind-dev" → "Monomind Dev". Leaves names that already have capitals or spaces alone. */
export function humanizeOrgName(name: string): string {
  const trimmed = name.trim();
  if (/[A-Z ]/.test(trimmed)) return trimmed;
  return trimmed
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function slugifyOrgName(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "org";
}

/** First `-2`, `-3`, … variant of `base` not in `taken`. */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function firstSentence(text: string): string {
  const match = text.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

/**
 * A one-line summary from the goal: the first sentence, cut back to a clause
 * boundary (em dash, semicolon, colon, comma) when it runs past the limit.
 */
export function deriveTagline(goal: string): string | null {
  const sentence = firstSentence(goal.replace(/\s+/g, " "));
  if (!sentence) return null;
  if (sentence.length <= TAGLINE_MAX) return sentence;

  const window = sentence.slice(0, TAGLINE_MAX - 1);
  // Prefer a strong break (dash, semicolon, colon); fall back to a comma.
  const strongCut = Math.max(window.lastIndexOf(" — "), window.lastIndexOf(" - "), window.lastIndexOf("; "), window.lastIndexOf(": "));
  const clauseCut = strongCut >= 60 ? strongCut : window.lastIndexOf(", ");
  if (clauseCut >= 60) return `${window.slice(0, clauseCut).trimEnd()}.`;

  const wordCut = window.lastIndexOf(" ");
  return `${window.slice(0, wordCut > 0 ? wordCut : window.length).trimEnd()}…`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > max / 2 ? space : cut.length).trimEnd()}…`;
}

function mdCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

/** Markdown story for the org page, built only from what the org file contains. */
export function buildOrgBody(org: OrgDef, topology: string | null): string {
  const roles = org.roles;
  const titleOf = new Map(roles.map((r) => [r.id, r.title || r.id]));
  const lines: string[] = [];

  // The goal is shown as the description; repeat it here only when it was too long to fit there.
  if (org.goal.trim().length > DESCRIPTION_MAX) {
    lines.push("## What this org does", "", org.goal.trim(), "");
  }

  lines.push(
    "## Team",
    "",
    `${roles.length} role${roles.length === 1 ? "" : "s"}${topology ? `, ${topology} topology` : ""}.`,
    "",
    "| Role | Type | Reports to |",
    "|---|---|---|",
    ...roles.map(
      (r) =>
        `| ${mdCell(r.title || r.id)} | ${mdCell(r.type)} | ${r.reports_to ? mdCell(titleOf.get(r.reports_to) ?? r.reports_to) : "—"} |`,
    ),
    "",
    "Each role's full responsibilities are in the **Roles** tab above.",
    "",
  );

  const rc = org.run_config;
  const settings = [
    `- Up to ${rc.max_concurrent_agents} agents at once`,
    `- Token budget: ${rc.budget_tokens.toLocaleString("en-US")}`,
    rc.workspace ? `- Workspace: \`${rc.workspace}\`` : null,
    org.schedule !== null ? `- Schedule: \`${String(org.schedule)}\`` : null,
  ].filter((s): s is string => s !== null);
  lines.push("## Run settings", "", ...settings, "");

  lines.push(
    "## Run it yourself",
    "",
    `Download the org file from this page, save it as \`.monomind/orgs/${org.name}.json\` in your project, then start it with [Monomind](https://monoes.me/projects/monomind):`,
    "",
    "```bash",
    `monomind org validate ${org.name}`,
    `monomind org run ${org.name}`,
    "```",
  );

  return truncate(lines.join("\n"), BODY_MAX);
}

/** Listing fields for a freshly uploaded org, derived from the org file. */
export function deriveOrgListing(org: OrgDef, topology: string | null): OrgListing {
  const goal = org.goal.trim();
  return {
    name: humanizeOrgName(org.name),
    slug: slugifyOrgName(org.name),
    tagline: goal ? deriveTagline(goal) : null,
    description: goal ? truncate(goal, DESCRIPTION_MAX) : null,
    body: buildOrgBody(org, topology),
  };
}
