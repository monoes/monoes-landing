import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { ENDPOINT_GROUPS } from "@/lib/docs/endpoint-registry";

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
  { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.5, lastModified: new Date() },
  { url: `${BASE_URL}/security`, changeFrequency: "yearly", priority: 0.5, lastModified: new Date() },
  { url: `${BASE_URL}/legal`, changeFrequency: "yearly", priority: 0.3, lastModified: new Date() },
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

const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
  url: `${BASE_URL}/blog/${post.slug}`,
  changeFrequency: "yearly" as const,
  priority: 0.6,
  lastModified: new Date(post.date),
}));

export default function sitemap(): MetadataRoute.Sitemap {
  return [...staticRoutes, ...blogRoutes, ...docsReferenceRoutes];
}
