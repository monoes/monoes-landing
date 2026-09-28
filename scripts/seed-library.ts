// Publishes the official library items (web automations, workflow
// templates, org templates) from a directory through the library API, as
// an admin. Safe to re-run: unchanged items are skipped, changed ones get
// a new version.
//
//   MONOES_TOKEN=<admin access token> npx tsx scripts/seed-library.ts <dir> --base-url http://localhost:3100 [--dry-run]
//
// <dir> is searched recursively: *.mpkg files are automations; *.json files
// are workflows (a "nodes" list) or orgs (a "roles" list). An automation's
// automation.json "category" becomes its tag. --base-url is required so a
// run never reaches production by default.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import { guessKind, slugify, validateArtifact } from "../src/lib/library/validate.ts";
import { bumpPatch, compareSemver } from "../src/lib/library/semver.ts";
import { KIND_PATH, LibraryError, type Kind, type LibraryItem } from "../src/lib/library/types.ts";
import { readZipEntry } from "../src/lib/library/zip.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(mpkg|json)$/i.test(entry.name)) out.push(p);
  }
  return out.sort();
}

async function category(bytes: Uint8Array): Promise<string | null> {
  const raw = await readZipEntry(bytes, "automation.json", 1024 * 1024);
  const c = raw ? (JSON.parse(new TextDecoder().decode(raw)) as { category?: unknown }).category : null;
  return typeof c === "string" && /^[a-z0-9][a-z0-9-]{0,31}$/.test(c) ? c : null;
}

async function main() {
  const dir = process.argv[2];
  const base = arg("base-url")?.replace(/\/+$/, "");
  const bearer = process.env["MONOES_TOKEN"] ?? "";
  const dryRun = process.argv.includes("--dry-run");
  if (!dir || dir.startsWith("--") || !base || (!bearer && !dryRun)) {
    console.error("usage: MONOES_TOKEN=<admin token> npx tsx scripts/seed-library.ts <dir> --base-url <url> [--dry-run]");
    process.exit(2);
  }
  const auth = { Authorization: `Bearer ${bearer}` };
  const api = `${base}/api/library`;

  if (!dryRun) {
    const me = await fetch(`${api}/me`, { headers: auth });
    if (!me.ok) throw new Error(`GET /me failed (${me.status}); is MONOES_TOKEN valid for ${base}?`);
    const { user } = (await me.json()) as { user: { username: string | null; email: string } };
    console.log(`Publishing to ${base} as ${user.username ?? user.email}`);
  }

  let failures = 0;
  for (const file of await walk(dir)) {
    const rel = relative(dir, file);
    const bytes = new Uint8Array(await readFile(file));
    const kind: Kind | null = guessKind(file, bytes);
    if (!kind) {
      console.warn(`skip     ${rel}: not an .mpkg, workflow or org`);
      continue;
    }
    let artifact;
    try {
      artifact = await validateArtifact(kind, bytes);
    } catch (err) {
      failures++;
      console.error(`invalid  ${rel}: ${err instanceof LibraryError ? err.message : err}`);
      continue;
    }
    const slug = kind === "automation" ? artifact.slug : slugify(artifact.name, kind);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const label = `${kind} ${slug}`;

    const existingRes = await fetch(`${api}/items/${kind}/${encodeURIComponent(slug)}`, { headers: auth });
    const existing = existingRes.ok ? ((await existingRes.json()) as LibraryItem) : null;
    if (!existing && existingRes.status !== 404) {
      failures++;
      console.error(`error    ${label}: GET returned ${existingRes.status}`);
      continue;
    }

    if (existing && existing.visibility !== "official") {
      failures++;
      console.error(`conflict ${label}: /library/${KIND_PATH[kind]}/${slug} is taken by a ${existing.visibility} item of ${existing.owner.username}`);
      continue;
    }
    if (existing && existing.sha256 === sha256) {
      console.log(`same     ${label} v${existing.version}`);
      continue;
    }

    const form = new FormData();
    form.set("file", new Blob([bytes as BlobPart]), rel.split("/").pop());
    let method: "POST" | "PUT";
    let url: string;
    let version: string;
    if (existing) {
      version = artifact.version ?? bumpPatch(existing.version);
      if (compareSemver(version, existing.version) <= 0) {
        failures++;
        console.error(`stale    ${label}: file is v${version}, library has v${existing.version} with different content; bump the version`);
        continue;
      }
      method = "PUT";
      url = `${api}/items/${existing.id}/artifact`;
    } else {
      version = artifact.version ?? "1.0.0";
      method = "POST";
      url = `${api}/items`;
      form.set("kind", kind);
      form.set("visibility", "official");
      form.set("name", artifact.name);
      if (kind === "automation") {
        const tag = await category(bytes);
        if (tag) form.set("tags", tag);
      }
    }
    if (kind !== "automation") form.set("version", version);

    if (dryRun) {
      console.log(`${method === "POST" ? "create" : "update"}   ${label} v${version} (dry run)`);
      continue;
    }
    const res = await fetch(url, { method, headers: auth, body: form });
    const body = (await res.json().catch(() => null)) as (LibraryItem & { error?: { message: string } }) | null;
    if (!res.ok) {
      failures++;
      console.error(`failed   ${label}: ${res.status} ${body?.error?.message ?? ""}`);
      continue;
    }
    console.log(`${method === "POST" ? "created" : "updated"}  ${label} v${body!.version} → ${body!.url}`);
  }
  if (failures) {
    console.error(`${failures} file(s) not published.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
