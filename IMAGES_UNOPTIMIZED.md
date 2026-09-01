# Why `images.unoptimized: true`?

**Decision:** Image optimization is disabled in `next.config.ts` (line 7).

**Rationale:**
1. **Static export compatibility** - The site is deployed as a static export, and Next.js image optimization requires a server.
2. **Pre-optimized assets** - All images in `/public/images/` are already optimized and properly sized before commit.
3. **Minimal image usage** - The site uses primarily SVG and pre-sized PNGs (logo variants, blog covers), not user-uploaded content.

**Trade-offs:**
- ✅ Works with static hosting (Vercel static, Netlify, GitHub Pages, etc.)
- ✅ No server-side image processing overhead
- ⚠️ No automatic WebP/AVIF conversion
- ⚠️ No automatic responsive srcsets

**Alternative considered:**
Using `next-image-export-optimizer` was evaluated but rejected due to build-time overhead and our pre-optimization workflow.

**Review date:** 2026-08-14
