import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community API",
  description: "REST API reference for the monoes.me community: features, bugs, orgs, posts, and voting.",
};

const ENDPOINTS = [
  { method: "GET", path: "/api/community/feed", summary: "Unified activity feed (posts, bugs, orgs)" },
  { method: "POST", path: "/api/community/features", summary: "Submit a feature request" },
  { method: "POST", path: "/api/community/features/{id}/vote", summary: "Vote on a feature" },
  { method: "POST", path: "/api/community/bugs", summary: "File a bug report" },
  { method: "POST", path: "/api/community/bugs/{id}/vote", summary: "Vote on a bug report" },
  { method: "POST", path: "/api/community/bugs/{id}/comments", summary: "Comment on a bug report" },
  { method: "POST", path: "/api/community/orgs", summary: "Upload an org definition" },
  { method: "POST", path: "/api/community/orgs/{id}/vote", summary: "Vote on an org upload" },
  { method: "POST", path: "/api/community/orgs/{id}/runs", summary: "Upload an org's run output files" },
  { method: "POST", path: "/api/community/posts", summary: "Create a community post" },
  { method: "POST", path: "/api/community/posts/{id}/vote", summary: "Vote on a post" },
];

export default function ApiDocsPage() {
  return (
    <main className="bg-ivory-warm px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="font-medium text-espresso text-2xl">Community API</h1>
        <p className="mt-2 text-sm text-espresso/70">
          REST endpoints backing the monoes.me community. All routes require an authenticated session unless noted
          otherwise. Machine-readable spec:{" "}
          <a href="/api/openapi.json" className="underline">
            /api/openapi.json
          </a>
          .
        </p>
        <div className="mt-8 space-y-2">
          {ENDPOINTS.map((e) => (
            <div key={e.method + e.path} className="rounded-lg border border-ivory-linen bg-ivory p-4">
              <p className="font-mono text-sm text-espresso">
                <span className="font-medium">{e.method}</span> {e.path}
              </p>
              <p className="mt-1 text-xs text-espresso/55">{e.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
