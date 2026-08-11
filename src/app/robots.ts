import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://monoes.me/sitemap.xml",
    host: "https://monoes.me",
  };
}
