# PRODUCT.md

## Register
brand: marketing/landing site. The homepage is a scroll-driven slide deck (manifesto tone), plus editorial sub-pages (whitepaper, product, research). Design IS the product here.

## Platform
web (Next.js App Router, responsive; no native targets)

## Users
- **Primary:** developers evaluating or using Monoes' open-source tools (Monomind, Mono Agent, MonoClip, MonoTask), technical, self-serve, drawn to the "$0, self-hosted, MIT" story.
- **Secondary (Monoes Workforce feature):** business/ops/finance leaders at companies evaluating AI-driven business-process automation, non-technical buyers who want an audited, priced, human-guided path in (not a GitHub link).

## Purpose
Showcase Monoes' open-source AI tooling, and, via the Monoes Workforce line, sell a paid, human-delivered service that applies the same orchestration engine (Monomind) to automate a company's back-office processes on its existing ERP/CRM/email.

## Positioning
"Autonomous AI teams you can run yourself for free, or hire us to run for your business." One engine (Monomind), two audiences: developers who self-host, companies who buy outcomes.

## Brand Personality
Confident, technical-but-human, tactical/terminal aesthetic (scanlines, tactical-grid backgrounds, monospace for anything code- or command-shaped). Manifesto-style copy ("Your company can run itself"). Warm, non-corporate palette (espresso/gold/ivory) instead of cold SaaS blue. Direct, declarative sentences; no filler adjectives.

## Anti-references
Generic SaaS-cream gradients, glassmorphism, stock-photo "enterprise handshake" imagery, tiny uppercase tracked eyebrows over every section, numbered 01/02/03 section scaffolding used decoratively rather than for a real sequence.

## Accessibility
Standard WCAG AA. Respect `prefers-reduced-motion` (existing homepage already gates its scroll/slide animations).

---

## Feature: Monoes Workforce (`/workforce`, `/workforce/how-it-works`, `/workforce/capabilities`)

Paid service line: AI digital workers that execute a client company's real business processes (invoice processing, AP/AR, HR onboarding, etc.) end-to-end on their existing ERP/CRM/email systems, powered by the open-source Monomind orchestration engine underneath. Positioned as a boutique consultancy on top of a base productized platform, not a finished self-serve SaaS yet.

- **Primary CTA:** book a priced Discovery engagement, 1-Day ($3,000) or 5-Day ($12,000), via prefilled `mailto:` links (same pattern as the homepage's closing CTA), not a form.
- **No public pricing beyond Discovery.** Implementation/pilot pricing is scoped after the audit, never state a number for it, except the 20% founding-client discount which is a stated term, not a number for the underlying price.
- **Belief ladder:** (1) this isn't a chatbot or RPA, it's a worker that finishes the process, (2) it sits on systems you already run, no rip-and-replace, (3) a human stays in the loop on high-risk decisions, (4) the entry point is a small, priced audit, not a multi-month sales cycle.
- **Proof strategy:** no client case studies exist yet. Never fabricate testimonials, logos, or metrics. Instead: (a) the Founding Client Program, first 3 clients get 20% off implementation in exchange for being a named reference/case study after go-live (source of truth: `foundingClientProgram` in `src/lib/workforce.ts`), (b) the "powered by Monomind" open-source tie-in (verifiable, public repo), (c) the specificity of the full capability catalog (`/workforce/capabilities`, 23 departments, 136 named workers) as evidence of real depth, not a marketing list.
- **Capability catalog:** `/workforce/capabilities` is sourced from `docs/monomind/10_فرآیندهای_end_to_end_برای_ارائه_به_مدیرعامل.md` (the 23-department, 136-agent internal catalog). Agent names are real content from that source doc, not invented. If that source doc changes, regenerate `capabilityCatalog` in `src/lib/workforce.ts` to match rather than hand-editing it out of sync.
- **Not yet built:** an interactive worker demo (paste a sample document, watch it move through extract → validate → decide → approve → post) was scoped as a phase-2 follow-up to the capability catalog, not built yet.
