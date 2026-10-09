/**
 * Fill in the listing fields (slug, display name, tagline, description, body)
 * for org uploads made before uploads derived them from the org file.
 * Only empty fields are filled, and the name only while it is still the raw
 * org-file name, so nothing an uploader edited is overwritten.
 *
 *   node --experimental-strip-types scripts/backfill-org-listings.ts --local
 *   node --experimental-strip-types scripts/backfill-org-listings.ts --remote [--dry-run]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OrgDefSchema } from "../src/lib/org-schema.ts";
import { deriveOrgListing, uniqueSlug } from "../src/lib/community/org-listing.ts";

const DB = "monoes-community";
const target = process.argv.includes("--remote") ? "--remote" : "--local";
const dryRun = process.argv.includes("--dry-run");

interface Row {
  id: string;
  slug: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  body: string | null;
  topology: string | null;
  org_json: string;
}

function d1(args: string[]): string {
  return execFileSync("npx", ["wrangler", "d1", "execute", DB, target, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

const sql = (v: string) => `'${v.replace(/'/g, "''")}'`;
const blank = (v: string | null) => !v || !v.trim();

const out = JSON.parse(
  d1(["--json", "--command", "SELECT id, slug, name, tagline, description, body, topology, org_json FROM org_upload ORDER BY created_at"]),
) as { results: Row[] }[];
const rows = out[0].results;
const taken = new Set(rows.flatMap((r) => (r.slug ? [r.slug] : [])));
const statements: string[] = [];

for (const row of rows) {
  const parsed = OrgDefSchema.safeParse(JSON.parse(row.org_json));
  if (!parsed.success) {
    console.warn(`skip ${row.id}: org file no longer validates`);
    continue;
  }
  const listing = deriveOrgListing(parsed.data, row.topology);
  const set: string[] = [];

  if (!row.slug) {
    const slug = uniqueSlug(listing.slug, taken);
    taken.add(slug);
    set.push(`slug = ${sql(slug)}`);
  }
  if (row.name === parsed.data.name && row.name !== listing.name) set.push(`name = ${sql(listing.name)}`);
  if (blank(row.tagline) && listing.tagline) set.push(`tagline = ${sql(listing.tagline)}`);
  if (blank(row.description) && listing.description) set.push(`description = ${sql(listing.description)}`);
  if (blank(row.body)) set.push(`body = ${sql(listing.body)}`);

  if (set.length) {
    statements.push(`UPDATE org_upload SET ${set.join(", ")} WHERE id = ${sql(row.id)};`);
    console.log(`${row.id} (${row.name}): ${set.map((s) => s.split(" =")[0]).join(", ")}`);
  }
}

if (!statements.length) {
  console.log("Nothing to backfill.");
} else if (dryRun) {
  console.log(`\n${statements.length} update(s) not applied (--dry-run).`);
} else {
  const file = join(mkdtempSync(join(tmpdir(), "org-backfill-")), "backfill.sql");
  writeFileSync(file, statements.join("\n"));
  d1(["--file", file, "--yes"]);
  console.log(`\nApplied ${statements.length} update(s) to ${target.slice(2)} D1.`);
}
