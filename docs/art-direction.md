# Art direction: Monoes homepage (draft for approval)

**Assumed brief** (the prompt's placeholders were not filled; inferred from PRODUCT.md): Monoes, open-source AI teams you self-host free (Monomind) or hire us to run (Workforce). Audience: developers + ops/finance leaders. Goal: pick a door (install, or book a priced Discovery). Tone: confident, warm, witty, luminous; NOT corporate SaaS blue, NOT espresso/gold. Stack kept: Next.js 16, Tailwind 4, GSAP (already installed); Lenis would be the one new dependency (needs your OK). Proof slots stay structural; no invented logos, quotes or metrics.

**Phase 0 findings:** PRODUCT.md/DESIGN.md prescribe espresso/gold (overridden per prompt). Satoshi + JetBrains Mono in use. Existing homepage was rebuilt recently and called "very weak". `agy` is installed but NOT signed in, so image generation is blocked until you run `agy` once.

## Visual thesis
**"One engine, two doors": a luminous sunrise over an empty office that staffs itself as you scroll.**

## Signature moment
**The Roster Sweep.** The hero is a calm grid of empty desks on a pale sky wash. A light bloom follows the pointer; wherever it passes, desks "wake" into named worker chips (Invoices, Onboarding, Reconciliation). Scrolling pulls the camera back until the whole grid is staffed and resolves into two doors: *Self-host free* and *Hire the team*. Real DOM for H1 and CTAs; the grid is CSS/SVG plus one small shader-free canvas bloom. Static fully-staffed poster for reduced motion.

## Three concept directions
1. **The Switchboard:** a patch panel where scroll plugs cables between engine and roles. Rejected: reads technical and dark-lab, hard to keep light and airy, weak for the buyer door.
2. **Roster Sweep (chosen):** empty desks to staffed company, light as the actor. Boldest that stays usable; it explains the product (digital workers) in 3 seconds and works for both audiences.
3. **Two Doors:** split hero with one core and two portals. Rejected: clear but static; closer to a template with nicer fonts. Its ending is kept as our final scene.

## Typography (approved: option 1)
- Display: **Fraunces** (variable), weight 300 for lead words against 800 for key words, opsz 144, SOFT 50 to 100, tracking -0.035em, clamp 3rem to 9rem.
- Text: **Figtree** 400/500/700, 17-18px body, 62ch measure.
- Mono: **JetBrains Mono** 400/600 for commands and worker chips.
- Scale 3x+: 14 / 18 / 32 / 64 / 144.

## Colour
Light-first, no near-black sections; one optional small ink-coloured footer. Three options with computed contrast tables are in `docs/art-direction/palettes.html` (open in a browser): **A Daybreak** (recommended: sky porcelain, coral + cobalt, navy ink), **B Citrus Mint**, **C Lilac Air**. All text pairs pass AA; C's yellow is fill-only.

## Atmosphere
Layered radial/conic blooms in the glow hue, 3% SVG grain, hairline ink grid with purpose, pointer-following light. No flat section fills.

## Motion language
Easing `cubic-bezier(.22,1,.36,1)` for reveals, `power3.inOut` for scrubs; 600-900ms reveals, 60ms stagger; only transform/opacity. One Lenis + ScrollTrigger setup. Nav and H1 readable before the intro ends. Reduced motion: no smooth scroll, pin, parallax; static staffed grid.

## Story sequence
1. Hero: empty desks, bloom, H1 + two doors (hook). 2. Sweep: the grid staffs itself (tension). 3. Show the work: one process traced step by step with a human approval gate (proof, structural). 4. Run it yourself: install command, MIT, $0 (door one). 5. Hire us: Discovery 1-Day / 5-Day (door two). 6. Trust: human-in-loop, audit trail. 7. Closing scene: the two doors.

## Assets
Hero, desks, workers and blooms are built in code (CSS/SVG/canvas), so most pages need no generated images. Optional agy images (OG card, one atmospheric plate) wait for sign-in; provenance goes in `assets/PROVENANCE.md`.

## Budget
Lighthouse mobile >= 90 all four; LCP < 2.0s, CLS < 0.05, INP < 200ms; page < 3MB; Fontsource/next/font with size-adjusted fallbacks.
