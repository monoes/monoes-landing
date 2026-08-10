# DESIGN.md

Source of truth: `src/styles/globals.css` (Tailwind v4 `@theme inline`). Values below are extracted, not invented.

## Color

| Token | Hex | Use |
|---|---|---|
| `--color-ivory` | `#FFFFF0` | base background |
| `--color-ivory-warm` | `#FAF7F0` | surface / section bg |
| `--color-ivory-parchment` | `#F5F0E8` | recessed surface |
| `--color-ivory-linen` | `#EDE5D8` | borders / dividers |
| `--color-espresso` | `#2A2318` | primary ink (headings, body) |
| `--color-espresso-deep` | `#1a1208` | dark section backgrounds (e.g. closing CTA) |
| `--color-gold` | `#C8A97E` | accent, links, borders |
| `--color-gold-dark` | `#8B6914` | accent-strong, CTA hover, primary brand accent |
| `--color-gold-bronze` | `#8B7355` | secondary text on nav/links |
| `--color-gold-warm` | `#B8956A` | secondary accent |
| `--color-gold-muted` | `#A07840` | tertiary accent |

Strategy: **restrained**: ivory/espresso neutrals carry the page, gold is the single accent family (~10% of surface), used for links, CTAs, borders, and the closing-CTA dark-espresso section as the one committed moment per page.

Existing per-project accent hexes (from `src/lib/projects.ts`) are also gold-family: `#8B6914`, `#C8A97E`, `#B8956A`, `#A07840`: new features should draw from this same ramp rather than introduce a new hue.

## Typography

- Sans: **Satoshi** (`--font-satoshi`, local, weights 200/400/500/700): body and UI text.
- Mono: **JetBrains Mono** (`--font-jetbrains`, Google Font): anything code/command/CLI-shaped, and small technical labels.
- Label tracking: `--tracking-label: 0.25em` for uppercase micro-labels (used sparingly: see anti-reference on eyebrows in PRODUCT.md).

## Motion

- `fadeInUp` keyframe (12px translate + opacity) for standard reveals.
- `whitepaper-blink` / `pulse-dot` for attention-getting live-status accents: used sparingly, not on every element.
- `html { scroll-behavior: smooth }` site-wide.
- Homepage gates its slide animations for reduced motion; new sections must do the same via `@media (prefers-reduced-motion: reduce)`.

## Existing component patterns to reuse

- **`close-option` / `close-split`** (`src/app/page.tsx`): two-column comparison card pattern with a mission tag, label, title, body, and CTA link: used for the homepage's "self-hosted vs. managed" choice. Directly reusable shape for Workforce's two Discovery packages.
- **`org-role`** grid cards (`src/app/page.tsx`): icon + department + title + sub + badge: reusable shape for a capabilities grid without inventing a new card system.
- **`ProjectPageLayout` / `ProjectHero`** (`src/components/projects/`): hero + feature grid + install steps pattern for product pages.
- **Research-style page composition** (`src/components/research/*`, used by `/whitepaper`): a page built from named section components (`ResearchHero`, `OperatingModel`, etc.) composed in the route file: this is the pattern for `/workforce` and `/workforce/how-it-works`.

## Shadows

`--shadow-soft: 0 4px 24px rgba(42,35,24,0.04)`, `--shadow-soft-lg: 0 8px 32px rgba(42,35,24,0.06)`: soft, low-opacity espresso-tinted shadows only. No hard drop shadows.
