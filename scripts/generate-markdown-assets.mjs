// Generates a `<path>.md` sibling for every public marketing/blog page's
// prerendered HTML, so agents requesting `Accept: text/markdown` can be
// served a real static asset (see src/middleware.ts) instead of relying on
// a request-time HTML->Markdown conversion, which proved unreliable inside
// the Cloudflare Worker (no working way to re-invoke Next's own rendering
// for a second, differently-headered request from inside itself).
//
// Run after `next build` (via `npx @opennextjs/cloudflare build`, which
// leaves `.next/server/app/**/*.html` intact) and before `wrangler deploy`.

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { NodeHtmlMarkdown } from "node-html-markdown";

const NEXT_APP_DIR = join(process.cwd(), ".next/server/app");
const ASSETS_DIR = join(process.cwd(), ".open-next/assets");

const EXCLUDED_BASENAMES = new Set(["_global-error.html", "_not-found.html"]);

function findHtmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      // Next also writes per-segment metadata directories like
      // "workforce.segments/" alongside "workforce.html" — skip anything
      // that isn't a plain content directory to avoid descending into them.
      if (entry.endsWith(".segments") || entry.endsWith(".rsc") || entry.endsWith(".meta")) continue;
      findHtmlFiles(full, out);
    } else if (entry.endsWith(".html") && !EXCLUDED_BASENAMES.has(entry)) {
      out.push(full);
    }
  }
  return out;
}

function htmlPathToPagePath(htmlFile) {
  const rel = relative(NEXT_APP_DIR, htmlFile).replace(/\.html$/, "");
  if (rel === "index") return "/";
  return "/" + rel;
}

function isEligible(pagePath) {
  return !pagePath.startsWith("/community");
}

function markdownAssetPath(pagePath) {
  return pagePath === "/" ? "/index.md" : pagePath + ".md";
}

const htmlFiles = findHtmlFiles(NEXT_APP_DIR);
let written = 0;

for (const htmlFile of htmlFiles) {
  const pagePath = htmlPathToPagePath(htmlFile);
  if (!isEligible(pagePath)) continue;

  const html = readFileSync(htmlFile, "utf-8");
  const markdown = NodeHtmlMarkdown.translate(html);

  const outPath = join(ASSETS_DIR, markdownAssetPath(pagePath));
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, markdown, "utf-8");
  written++;
}

console.log(`generate-markdown-assets: wrote ${written} markdown asset(s) to .open-next/assets`);
