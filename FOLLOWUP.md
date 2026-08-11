# Follow-up: what's left after the content-accuracy pass

Branch `content-accuracy-fix` (built on top of a pre-existing WIP checkpoint, commit `0069613`) fixed the *fabrication* half of this site: the blog described a fictional ERP/workforce product with invented metrics, wrong license, fake author personas, and images with fabricated stats baked into the pixels. That's done — see the commit/PR for `content-accuracy-fix` for the full list.

This doc covers what's still open. Most of it comes from a six-agent review (`REVIEW.md`, already in the repo, written before the content-accuracy pass) — this doc re-verifies each item against the current tree so it doesn't repeat anything already fixed.

## Already fixed (verified current, no action needed)

- ~~MIT license claims~~ → Apache-2.0 everywhere (content-accuracy pass)
- ~~Blog author personas (Dr. Alex Vance, Marcus Chen, Elena Rostova)~~ → "Monoes Team" (content-accuracy pass)
- ~~Fabricated "89 worker roles" ERP narrative~~ → rewritten around real releases (content-accuracy pass)
- ~~Homepage has no nav link to `/workforce` or `/blog`~~ → both present in `Navbar.tsx` and the homepage's own inline nav (`src/app/page.tsx:854-858`) — already fixed by the pre-existing WIP
- ~~Discovery CTA routes to a personal Gmail~~ → `discoveryContactEmail = "hello@monoes.me"` (`src/lib/workforce.ts:135`) — already fixed
- ~~`go install github.com/monoes/mono-agent@latest` is broken (wrong module path)~~ → replaced with `go build -o monoagentcli ./cmd/monoagentcli` (`src/lib/projects.ts:149`) — already fixed
- ~~CLI binary named `monoes` instead of the real `monoagentcli`~~ → all examples in `src/lib/projects.ts` now use `monoagentcli` — already fixed
- ~~Version stale at v2.8.4~~ → v2.9.2 everywhere checked (`src/app/page.tsx:896,1339`, `src/lib/projects.ts:82`) — already fixed

## Still open

### 1. Worker-count inconsistency (new, introduced by the content-accuracy pass)
Two files now disagree on the same claim:
- `src/app/page.tsx:953` — "8 background workers" (I corrected this to match the verified monomind dossier: 8 on-demand workers at session start)
- `src/lib/projects.ts:76` — "7 background workers" (untouched, pre-existing)

**Action:** pick one number and apply it in both places. Ground truth is genuinely ambiguous — monomind's own docs disagree with each other (README says 8 on-demand workers; `@monoes/hooks` package.json describes 15 in its WorkerManager; the actual `packages/@monomind/hooks/src/workers/` directory has 11 entries). Before fixing the site, someone needs to reconcile this in the monomind repo itself, or pick the most defensible number (8, the on-demand/session-start set) and cite it consistently.

### 2. Zero analytics on the site
No tracking (`gtag`, Plausible, PostHog, etc.) found anywhere in `src/app/layout.tsx` or `src/app/page.tsx`. There's no way to measure whether the Discovery CTA, blog, or nav changes in this pass actually move anything. Needs a decision on what to install (privacy-respecting options: Plausible, Fathom, or self-hosted PostHog would fit the site's "sovereign/local-first" positioning better than GA).

### 3. Orphaned `/projects/monochat` route
`src/app/(main)/projects/monochat/architecture/` still exists as a real page (492 lines per the original review) for a product that isn't listed anywhere else on the site. `next.config.ts` already redirects `/projects/monochat/architecture` → `/projects/monomind/architecture`, but the source file is still there, unused, and will keep showing up in any future audit. Either delete the page (the redirect makes it moot) or confirm monochat is a real, upcoming product and give it a real listing.

### 4. Funnel/conversion issues from `REVIEW.md` Part 2 (not re-verified in detail — re-check before acting)
`REVIEW.md` flagged several structural issues in the paid Workforce funnel that this pass didn't touch:
- No `/team` page
- No pricing/ROI calculator or case-study placeholder despite the "no case studies yet" honesty framing being solid
- SEO gaps (re-check `REVIEW.md` Part 2 directly — it has file:line citations for each)

These weren't re-verified against the current tree the way items 1-3 above were, since they're UX/conversion judgment calls rather than fact-checks. Read `REVIEW.md` Part 2 fresh before acting on it, since some structural claims (like the missing nav links) turned out to already be fixed.

### 5. `DEMO_VIDEO.md`
A 90-second product demo shot list already exists in the repo, scripted against `workforce.ts`'s example pipeline. Unactioned — no video has been recorded. Low priority, but it's sitting there ready if someone wants to record it.

### 6. Git housekeeping (found during this pass)
- The project moved drives mid-session (`/Volumes/media/projects/monoes` → `/Volumes/SD1/projects/monoes`), which surfaced a branch mismatch: the `content-accuracy-fix` branch was created but the working tree ended up back on `main` with all the content-accuracy changes staged as uncommitted. Nothing is lost, but **verify which branch the content-accuracy diff actually lands on before committing** — don't assume `content-accuracy-fix` has it.
- `main` also picked up an unrelated commit (`ed00e31`, "clean up JSX text string whitespace to prevent React hydration warnings") shortly after the checkpoint commit — real, intentional, not part of this pass, just worth knowing it's there when reviewing history.

## How to verify before acting
Everything in "Already fixed" was re-checked with `grep`/`Read` against the current tree as of this doc, not assumed from `REVIEW.md`'s original findings — some of what that review flagged had already been fixed by the time this doc was written. Re-verify anything here the same way before starting work, since the tree will keep moving.
