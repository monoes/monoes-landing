import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { ENDPOINT_GROUPS } from "@/lib/docs/endpoint-registry";
import { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { libraryItem } from "@/lib/db/library-schema";
import { KIND_PATH, type Kind } from "@/lib/library/types";
import { COMPARISONS, GUIDES } from "@/lib/guides";

// Org and library pages are D1-backed and change as runs/comments/uploads are added - generate
// this per-request rather than baking a stale list in at build time.
export const dynamic = "force-dynamic";

const BASE_URL = "https://monoes.me";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0, lastModified: new Date() },
  { url: `${BASE_URL}/workforce`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date() },
  { url: `${BASE_URL}/workforce/how-it-works`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
  { url: `${BASE_URL}/workforce/capabilities`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
  { url: `${BASE_URL}/product`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date() },
  { url: `${BASE_URL}/whitepaper`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  { url: `${BASE_URL}/community`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7, lastModified: new Date() },
  { url: `${BASE_URL}/changelog`, changeFrequency: "weekly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.5, lastModified: new Date() },
  { url: `${BASE_URL}/security`, changeFrequency: "yearly", priority: 0.5, lastModified: new Date() },
  { url: `${BASE_URL}/legal`, changeFrequency: "yearly", priority: 0.3, lastModified: new Date() },
  { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3, lastModified: new Date() },
  { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3, lastModified: new Date() },
  { url: `${BASE_URL}/projects/monomind`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
  { url: `${BASE_URL}/projects/mono-agent`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
  { url: `${BASE_URL}/projects/mono-clip`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  { url: `${BASE_URL}/projects/monotask`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  { url: `${BASE_URL}/projects/monomind/architecture`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/projects/mono-agent/architecture`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/projects/mono-clip/architecture`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/projects/monotask/architecture`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/docs`, changeFrequency: "weekly", priority: 0.8, lastModified: new Date() },
  { url: `${BASE_URL}/docs/authentication`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  { url: `${BASE_URL}/docs/quickstart`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  { url: `${BASE_URL}/docs/discovery`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/docs/mcp`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/docs/errors`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
  { url: `${BASE_URL}/docs/reference`, changeFrequency: "weekly", priority: 0.7, lastModified: new Date() },
];

const docsReferenceRoutes: MetadataRoute.Sitemap = ENDPOINT_GROUPS.map((group) => ({
  url: `${BASE_URL}/docs/reference/${group.slug}`,
  changeFrequency: "monthly" as const,
  priority: 0.5,
  lastModified: new Date(),
}));

const guideRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/compare`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  { url: `${BASE_URL}/guides`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  ...[
    ...COMPARISONS.map((g) => ({ path: `/compare/${g.slug}`, updated: g.updated })),
    ...GUIDES.map((g) => ({ path: `/guides/${g.slug}`, updated: g.updated })),
  ].map(({ path, updated }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    lastModified: new Date(updated),
  })),
];

const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
  url: `${BASE_URL}/blog/${post.slug}`,
  changeFrequency: "yearly" as const,
  priority: 0.6,
  lastModified: new Date(post.date),
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();
  const [orgs, libraryItems] = await Promise.all([
    db.select({ id: orgUpload.id, slug: orgUpload.slug, createdAt: orgUpload.createdAt }).from(orgUpload),
    // Private items are owner-only; gallery orgs are already listed under /community/orgs.
    db
      .select({ kind: libraryItem.kind, slug: libraryItem.slug, visibility: libraryItem.visibility, updatedAt: libraryItem.updatedAt })
      .from(libraryItem)
      .where(inArray(libraryItem.visibility, ["public", "official"])),
  ]);
  const libraryRoutes: MetadataRoute.Sitemap = libraryItems.map((i) => ({
    url: `${BASE_URL}/library/${KIND_PATH[i.kind as Kind]}/${i.slug}`,
    changeFrequency: "weekly" as const,
    priority: i.visibility === "official" ? 0.6 : 0.4,
    lastModified: i.updatedAt,
  }));
  const orgRoutes: MetadataRoute.Sitemap = orgs.map((o) => ({
    url: `${BASE_URL}/community/orgs/${o.slug ?? o.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.4,
    lastModified: o.createdAt,
  }));

  return [
    ...staticRoutes,
    { url: `${BASE_URL}/community/orgs`, changeFrequency: "weekly", priority: 0.6, lastModified: new Date() },
    ...orgRoutes,
    { url: `${BASE_URL}/community/workflows`, changeFrequency: "daily", priority: 0.6, lastModified: new Date() },
    { url: `${BASE_URL}/community/automations`, changeFrequency: "daily", priority: 0.6, lastModified: new Date() },
    { url: `${BASE_URL}/library`, changeFrequency: "daily", priority: 0.7, lastModified: new Date() },
    ...libraryRoutes,
    ...guideRoutes,
    ...blogRoutes,
    ...docsReferenceRoutes,
  ];
}
