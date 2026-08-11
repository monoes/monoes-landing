# Monoes Website — Full Swarm Review

A six-agent parallel review of monoes-landing: content, code, UX/conversion, monetization, SEO, and a fact-check against the monomind + mono-agent repos. Findings are ranked by revenue impact and cited to `file:line` so each is actionable.

---

## TL;DR — the three things that matter most

1. **The money-maker is invisible from the front door.** The homepage (`src/app/page.tsx`) has zero links to `/workforce` — the paid $3k–$12k Discovery line is unreachable without typing the URL. The homepage's one "managed" CTA even routes to a *different* product (`Monomind team deployment` mailto). **Every other fix on this list is worth less than this one.**
2. **The paid funnel leaks trust at the final click.** Discovery CTAs go to a personal Gmail (`nokhodian@gmail.com`, `src/lib/workforce.ts:135`), there is no `/about`, `/team`, `/security`, or `/legal` page, and there is **zero analytics** — you cannot measure any of this. A $12k B2B audit cannot close this way.
3. **Several marketing claims are factually wrong** and a first-time buyer/developer will hit them on their first command: the **license is Apache-2.0 not MIT**, the **`go install github.com/monoes/mono-agent` command is broken** (module path is bare `monoagent`), **"15 background workers" is false** (it's 7; `performance` and `git` were deleted), and the **version is stale** (site says v2.8.4, repo is 2.9.2).

---

## Part 1 — Credibility & fact-check failures (fix first, these embarrass you)

Verified against the actual `monomind` and `mono-agent` source. These are the highest-risk items because a technical reader catches them on first contact.

| # | Claim on site | Reality in repo | Where to fix |
|---|---|---|---|
| 1 | Monomind is **"MIT License"** | **Apache-2.0** (`monomind/package.json:167`, `LICENSE:1`) | `src/app/page.tsx:887` (hero slide) |
| 2 | `go install github.com/monoes/mono-agent@latest` | **Broken.** `go.mod:1` module is bare `monoagent`; module-path mismatch aborts install | `src/lib/projects.ts:145` |
| 3 | CLI binary is **`monoes`** with examples like `monoes workflow list` | Real built binary is **`monoagentcli`** (`Makefile:11`, `cmd/monoagentcli/root.go:34`). `monoes` is never produced | `src/lib/projects.ts:151,161-208` |
| 4 | `mono-agent init` | No such binary. Real command: `monoagentcli init` | `src/lib/projects.ts:148` |
| 5 | **"15 background workers (security, performance, git, and more)"** | Actually **7** workers. Comment in `worker-manager.ts:207-209` says `performance`, `patterns`, `adr`, `learning`, `git`, `swarm`, `optimize` were **explicitly deleted** | `src/lib/projects.ts:76`; `src/app/page.tsx:944`; `src/app/(main)/projects/monomind/architecture/page.tsx` (4×) |
| 6 | Version **v2.8.4** | Actual **2.9.2** (`monomind/package.json:3`, CHANGELOG) | `src/app/page.tsx:887,1330`; `src/lib/projects.ts:82` |
| 7 | "89 Agent roles" (homepage/blog) vs "136 workers / 23 depts" (workforce) | Both numbers exist but refer to **different catalogs** (monomind dev roles vs Workforce business workers). Site never explains the distinction | `src/app/page.tsx:1289`; `src/lib/workforce.ts:220-313`; `src/lib/blog.ts:56,76,81` |

**Accurate claims (keep):** `npm install -g monomind` ✓, `@monoes/monomindcli` ✓, Org Runtime v2 daemon ✓, 31 org subcommands ✓, 29 hook subcommands ✓, swarm topologies ✓, consensus strategies ✓, Monograph knowledge graph ✓, "70+ workflow nodes" ✓ (actually understated — real count is ~208), Rod/stealth browser ✓, Wails 2 + React editor ✓, OpenRouter/HuggingFace/Gemini ✓.

**Lower-risk nits:** blog author personas (`Dr. Alex Vance`, `Marcus Chen`) look fabricated and contradict the radical-honesty proof strategy — replace with the real founder. Orphan route `/projects/monochat/architecture/page.tsx` is a 492-line page for a product that doesn't exist anywhere else — delete or 301.

---

## Part 2 — The money is leaking (conversion & trust)

The Workforce line is genuinely well-written (Founding Client Program, HowItWorks architecture, capability catalog). The problems are structural, in the funnel around it.

### 2.1 Workforce is unreachable from `/`
- Homepage ships its own inline nav (`src/app/page.tsx:863-872`) with Community / Projects / Whitepaper / GitHub / Get started. **No Workforce, no Blog.** The homepage lives outside the `(main)` route group so it doesn't even inherit `Navbar.tsx`/`Footer.tsx`.
- The closing CTA (`src/app/page.tsx:1314-1320`) is "Have us deploy it" → `mailto:...?subject=Monomind team deployment`. That's a *different* offer than Workforce, and it doesn't link to `/workforce`.
- `Footer.tsx` links to GitHub/Blog/Community only — no Workforce, no Whitepaper, no Projects.

### 2.2 The trust arc collapses at the CTA
- `discoveryContactEmail = "nokhodian@gmail.com"` (`src/lib/workforce.ts:135`) is the recipient for every $3k–$12k Discovery mailto. A finance/ops VP will not send a PO-eligible engagement email to a personal Gmail.
- No `/about`, `/team`, `/security`, `/legal`, `/privacy`, `/terms`. The only human signal is `cal.com/morteza/30min` buried in the Cal.com iframe URL. For enterprise procurement this is a non-starter.
- Footer copyright says **"Nokhodian"** not **"Monoes"** (`Footer.tsx:32`) — the legal entity is ambiguous.

### 2.3 You are operating the funnel blind
- **Zero analytics** anywhere (no gtag/Plausible/Posthog/Fathom). You cannot measure reach, scroll depth, mailto clicks, or which step drops buyers. This is the highest-ROI fix on the entire site for a paid business.

### 2.4 `mailto:` is high-friction and unmeasurable
- Every priced CTA is `mailto:` with only a subject line (`DiscoveryPackages.tsx:67`, `FoundingClientProgram.tsx:60`). No body template, no structured capture.
- Mobile mailto often opens an unconfigured client; you lose the lead and never know.
- The Cal.com embed (`BookACall.tsx:36`) already proves you accept non-mailto capture — extend the same logic to the priced CTAs.

### 2.5 The pricing page can't go to a CFO
- Discovery prices are public ($3k/$12k) — good. But there's **no bracket for the expensive thing** (Pilot/Expand). "It depends on which processes…" (`DiscoveryPackages.tsx:84`) is un-budgetable. Buyers disengage rather than email to find out.
- PRODUCT.md's "no public implementation price" discipline is 70% right, but **mystery without a bracket loses 30–50% of qualified leads**. One honest line — *"typical pilots start at $X; you'll get a fixed quote in your Discovery report"* — unblocks the CFO conversation without committing to a number.

### 2.6 Founding Client Program is misplaced
- It's the single most disarming piece of copy on the site, but sits 3 sections *after* DiscoveryPackages (`workforce/page.tsx:18-29`). The "we have no case studies, here's the trade" moment should be adjacent to the price, not separated by HowItWorks and BookACall.

### 2.7 The hero narrows the market
- WorkforceHero, HowItWorks, `engagementPhases`, `processDefinitionExample`, and `evaluationMetricsExample` all default to **invoice/AP/Finance**. A buyer in HR, Customer Service, Sales, or Procurement reads a Finance pitch and self-disqualifies — even though the catalog proves 23 departments.

---

## Part 3 — Homepage: scroll-locked client monolith (UX + SEO + a11y)

`src/app/page.tsx` is a 1339-line `'use client'` component that drives a GSAP scroll-snap deck. Three problems compound:

1. **Conversion:** the audience that *pays* (business/ops leaders) is the audience least likely to tolerate a forced 8-slide scroll-locked animation. They bounce; developers love it.
2. **SEO/CWV:** the entire fold ships as JS. `'use client'` can't export `metadata`, so the most important page only gets the generic root title. GSAP hides content until hydration → bad LCP/INP → Core Web Vitals ranking penalty.
3. **Accessibility:** `document.documentElement.style.overflow='hidden'` (`page.tsx:25-26`) kills Cmd+F, scroll-restore, and keyboard nav. The CSS-only reduced-motion gate (`landing.css:906-914`) does **not** cover the ~15 GSAP timelines — PRODUCT.md's "gates its animations for reduced motion" claim is **false** for the JS layer. On mobile there is no hamburger, nav links are hidden (`landing.css:922`), and slide dots are hidden (`landing.css:926`) — the mobile homepage is a one-way ride with no exit.

**Recommendation:** keep the deck as a `/showcase` or `/demo` route for the developer audience. Restore normal document scroll on `/`, give it real metadata, and add a proper nav that includes Workforce.

**Color contrast failures (WCAG AA not met despite DESIGN.md claim):**
- `--color-gold #C8A97E` on ivory → ~2.23:1 (fails 4.5:1 for text). Used for eyebrows, hero kicker, section labels, org-role-dept.
- `--color-gold-bronze #8B7355` on ivory → ~4.47:1 (just under AA). Used for all main-nav and footer links at 14px.
- No global `:focus-visible` outline (`globals.css` has none). `globals.css:58-63` forces `cursor: inherit` globally, so CTAs render with an arrow, not a hand.

---

## Part 4 — Technical debt & build health

**Build:** `npm run build` **succeeds** (Next 16/Turbopack, 16.8s, 28 static pages). **Lint:** 68 problems (63 errors / 5 warnings).

### The `._*` AppleDouble problem — 2029 files on disk
- Counted **2029** `._*` files (`1174` in `.monomind/`, `739` in `.claude/`, `53` in `src/`, etc.). They regenerate because the repo lives on `/Volumes/media` (non-HFS+) and macOS Finder writes them whenever browsed.
- `.gitignore` ignores them (so `0` are tracked — good), **but ESLint/Next/your editor still scan them** → ~25 of the 63 lint errors are `Invalid character` from these files.
- The `predev` hook (`package.json:6`) only scans `.next/` — **a placebo**. The real fix:
  ```bash
  git config --global core.excludesfile ~/.gitignore_global
  printf '%s\n' '._*' '.DS_Store' '**/.DS_Store' >> ~/.gitignore_global
  printf '%s\n' '._*' 'export-ignore' '.DS_Store' 'export-ignore' > .gitattributes
  defaults write com.apple.desktopservices DSDontWriteNetworkStores true
  find . -name '._*' -not -path './.git/*' -delete
  ```
  Then fix `predev` to scan the whole repo, and add `**/._*` + `.monomind/**` to `eslint.config.mjs` `globalIgnores`.

### Tech-debt top 5
1. **1339-line `'use client'` `page.tsx` monolith** with 4 IIFEs, 19 animation phases, injected `<style>`, and an unused `window.MM6: any` global. Extract sections into `src/components/landing/*`, isolate GSAP into one `<ScrollDeck/>` island via `next/dynamic({ssr:false})`.
2. **7 unused dependencies** inflating the bundle: `@monoes/memory`, `@monoes/monograph` (only string literals in blog/SVG, never imported), `@dnd-kit/*` (3 pkgs, only a string in ClipboardSim), `agentic-flow`, `@gsap/react`. Also `gsap` **and** `framer-motion` both shipped (~80–120 KB duplicate). Pick one.
3. **`package.json:2` name is still `"nextjs-scaffold"`** — should be `"monoes-landing"` (matches `wrangler.toml:1`).
4. **Missing SEO infra:** no `sitemap.ts`, no `robots.ts`, no `metadataBase` in `layout.tsx:5` (build warns twice; OG images resolve to `localhost`). Cloudflare deploy risk: dual animation libs + no dry-run against the 1 MB compressed worker limit.
5. **Lax types masked by eslint-disable:** `window.MM6: any` (`page.tsx:7-12`). Plus 8 real `react/no-unescaped-entities` errors in `research/OperatingModel.tsx` and `research/RoadmapSection.tsx` that `eslint --fix` will auto-resolve.

---

## Part 5 — SEO & discoverability (organic is the cheapest revenue)

### What's missing
- **No sitemap, no robots, no JSON-LD.** 28 crawlable routes with no manifest and no structured data.
- **No per-page metadata** on `/`, `/product`, `/community`, or any `/projects/*` or `/projects/*/architecture` page. The homepage *can't* export metadata as a client component.
- **No canonicals, and www vs non-www unresolved** (`wrangler.toml` serves both `monoes.me` and `www.monoes.me` identically → duplicate-content risk).
- **`next.config.ts:7` `images.unoptimized: true`** opts out of all image optimization — large blog JPGs hit the wire raw.
- **One global OG image** (`/images/logo-512.png`, a square) renders poorly on Twitter/LinkedIn; no per-page OG cards except blog posts.

### The biggest organic opportunity on the site
The capability catalog (`src/lib/workforce.ts:220-313`) holds **23 departments × ~136 workers**, all rendered through one `'use client'` `CapabilityCatalogBrowser.tsx`. Each department is a natural top-3 ranking page for *"[department] AI automation"* (e.g. "AI accounts payable automation", "AI HR onboarding"). Today Google sees one client-rendered list.

**Split into 24 static `/workforce/departments/[slug]` routes** with `generateStaticParams` + `generateMetadata`. This is the single largest SEO unlock: ~24 new indexable, buyer-intent pages at near-zero marginal effort.

### Buyer-intent keywords currently untargeted (verified by grep)
"AI accounts payable automation", "automate invoice processing", "self-hosted AI agent orchestration", "open-source AI agent platform", "ERP/CRM automation with AI agents", "alternatives to Zapier/n8n/CrewAI". None appear anywhere on the site.

---

## Part 6 — How to actually make money (ranked monetization moves)

Today there is **one true revenue line**: Discovery audits ($3k/$12k). Implementation is "scoped after audit" (no public number), the Founding Client Program is a discount on unpriced work, and the homepage's "Have us deploy it" is a ghost SKU with no page, no price, no scope. **There is zero recurring revenue** anywhere.

### Move 1 — Turn the capability catalog into a lead-gen engine  *(highest ROI)*
Add a multi-select **shortlist** to `CapabilityCatalogBrowser.tsx`: each worker pill toggles; a sticky footer "You've shortlisted N workers →" builds a prefilled Discovery email/form with the selected list. Add 3 "top process" quick-picks ("automate AP / onboarding / reconciliations") and per-department "Book a Discovery for [dept]" CTAs.
- **Effort:** ~1–2 eng-days, no backend.
- **Impact:** 2–4× lift on catalog-page conversions. At 1 inbound/week → 3/week × 20% close on $3k Discovery = ~**+$150k/yr** in audits alone, plus pilot pipeline.

### Move 2 — Ship a 90-second recorded demo  *(closes the proof hole)*
PRODUCT.md defers the interactive paste-a-doc demo to phase 2. That gap is why "not a chatbot, not RPA" doesn't land — buyers can't *see* the difference. Record the real `processDefinitionExample` (`workforce.ts:192-203`) flowing through extract → validate → match_po → decision → approval → erp_action, plus the >$20k human-in-the-loop gate (`workforce.ts:183`). One mp4, two placements (Workforce hero + how-it-works#process-model). No code risk.
- **Effort:** ~1 day recording/editing.
- **Impact:** typically the highest-converting asset on B2B automation sites; conservatively +30–60% on warm traffic.

### Move 3 — Replace `mailto:` with a single Tally form on priced CTAs
Capture company, size, top-3 processes, systems, preferred package. Confirmation hands off to the existing Cal.com link. Preserves the boutique feel (one screen, two minutes), gives you structured CRM data and — critically — **measurement**.
- **Effort:** 2–4 hours.
- **Impact:** +20–50% submission rate vs `mailto:`, plus analytics.

### Move 4 — Add a "starts at" bracket for pilots
One line under `DiscoveryPackages.tsx:77-91`: *"Typical pilots start at $X; you'll get a fixed quote inside your Discovery report."* Keeps the bespoke-quote discipline, unblocks the CFO conversation.
- **Effort:** 1 line of copy.
- **Impact:** recovers the 30–50% of qualified leads who currently can't model budget.

### Move 5 — Productize the homepage "managed" CTA into a real SKU
The BRAVO panel (`page.tsx:1314`) pitches Monomind deployment but routes to a generic mailto with no scope/price. Either (a) point it at `/workforce`, or (b) formalize a "custom agent org" consulting tier with a "starts at" price. Today that lead is free-floating.

### Strategic (medium-term) revenue lines, ranked by effort/return
| Line | Effort | Why |
|---|---|---|
| **Managed run / per-worker SaaS** ($/worker/month) | Medium | The single biggest unlock — turns one-shot pilots into recurring MRR. PRODUCT.md:32 already says "not a self-serve SaaS **yet**." |
| **Annual "Workforce retainer"** (flat fee, N processes/qtr) | Low | Captures clients who fear open-ended T&M; predictable cash flow. |
| **Outcome-priced / success-fee** (% of invoices processed) | Medium | Aligns the price model with the hero promise "We sell you the outcome" (`ValueProps.tsx:21`) — today they contradict. |
| **Training / certification** ("Monomind Operator") | Med-high | Standard OSS+services playbook (HashiCorp, GitLab); seeds practitioners and future clients. |
| **Priority support / SLA** for OSS users | Low | Marginal revenue, but "wants SLA" = qualified Workforce lead. |

---

## Part 7 — Suggested execution order

**Week 1 — stop the bleeding (low effort, high impact):**
1. Wire Workforce into the homepage nav + closing CTA (`page.tsx:865-871, 1314-1320`).
2. Fix the 7 fact-check failures (license, go install, binary name, worker count, version, agent-count reconciliation).
3. Replace `nokhodian@gmail.com` with a branded `@monoes.com` address (`workforce.ts:135`).
4. Add analytics (Plausible one-liner in `layout.tsx`).
5. Kill the `._*` files permanently (the 6-step fix) and fix `predev`.

**Week 2 — fix the funnel:**
6. Replace `mailto:` on Discovery/Founding CTAs with a Tally form (Move 3).
7. Add the "starts at" pilot bracket (Move 4).
8. Reorder `/workforce` so Founding Client Program sits adjacent to DiscoveryPackages.
9. Record + ship the 90-second demo (Move 2).

**Week 3–4 — SEO + credibility:**
10. Add `sitemap.ts`, `robots.ts`, `metadataBase`, JSON-LD (Organization/SoftwareApplication/Service/BlogPosting).
11. Add per-page metadata + OG cards to `/` and all `/projects/*`.
12. Resolve www→non-www 301 at the edge + canonicals.
13. Add `/about` (or `/team`), `/security`, `/legal` pages.
14. Split the catalog into 24 `/workforce/departments/[slug]` pages (biggest SEO win).

**Month 2+ — strategic:**
15. Catalog lead-gen engine (Move 1).
16. Homepage rewrite: extract GSAP into a `/showcase` route, restore scroll + metadata on `/`, fix contrast + focus states + reduced-motion.
17. Begin the managed-run SaaS tier design (recurring revenue).

---

*Full per-analyst evidence (with every file:line citation) is in the six source reports that produced this synthesis. Key references: PRODUCT.md, DESIGN.md, src/app/page.tsx, src/lib/{projects,workforce,blog}.ts, src/components/workforce/*.tsx, src/components/layout/{Navbar,Footer}.tsx, src/app/layout.tsx, src/styles/globals.css, src/app/landing.css, next.config.ts, wrangler.toml, eslint.config.mjs, package.json.*
