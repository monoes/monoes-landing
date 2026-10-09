"use client";

import { useRef, useState } from "react";
import type { FeedItem } from "@/lib/community/feed";
import { FeedCard } from "./FeedCard";
import { goToLogin } from "@/lib/community/go-to-login";

type SortMode = "latest" | "popular";

const VOTE_PATH: Record<FeedItem["type"], string> = {
  post: "posts",
  bug: "bugs",
  feature: "features",
  org: "orgs",
  workflow: "library",
  automation: "library",
};

export function FeedList({
  initialItems,
  initialHasMore,
  authorId,
}: {
  initialItems: FeedItem[];
  initialHasMore: boolean;
  authorId?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());
  const [feedError, setFeedError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  function buildFeedUrl(sort: SortMode, page: number) {
    const params = new URLSearchParams({ sort, page: String(page) });
    if (authorId) params.set("authorId", authorId);
    return `/api/community/feed?${params.toString()}`;
  }

  async function handleSortChange(mode: SortMode) {
    if (mode === sortMode) return;
    setFeedError(null);
    setSortMode(mode);
    setPage(0);
    const thisRequestId = ++requestIdRef.current;
    try {
      const res = await fetch(buildFeedUrl(mode, 0));
      if (thisRequestId !== requestIdRef.current) return; // a newer request superseded this one
      if (!res.ok) {
        setFeedError("Could not load the feed. Please try again.");
        return;
      }
      const data = (await res.json()) as { items: FeedItem[]; hasMore: boolean };
      setItems(data.items);
      setHasMore(data.hasMore);
    } catch {
      if (thisRequestId !== requestIdRef.current) return;
      setFeedError("Something went wrong. Please try again.");
    }
  }

  async function handleLoadMore() {
    if (loadingMore) return; // ignore re-entrant clicks
    setFeedError(null);
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(buildFeedUrl(sortMode, nextPage));
      if (!res.ok) {
        setFeedError("Could not load more items. Please try again.");
        return;
      }
      const data = (await res.json()) as { items: FeedItem[]; hasMore: boolean };
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      setFeedError("Something went wrong. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleVote(id: string, type: FeedItem["type"], value: -1 | 0 | 1) {
    if (votingIds.has(id)) return;
    setFeedError(null);
    setVotingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/community/${VOTE_PATH[type]}/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.status === 401) {
        goToLogin();
        return;
      }
      if (!res.ok) {
        setFeedError("Could not record your vote. Please try again.");
        return;
      }
      const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, score: data.score, myVote: data.myVote } : i)));
    } catch {
      setFeedError("Something went wrong. Please try again.");
    } finally {
      setVotingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div>
      <div role="group" aria-label="Sort the feed" className="mb-6 inline-flex rounded-full border border-ivory-linen bg-ivory p-1">
        {(["latest", "popular"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => handleSortChange(mode)}
            aria-pressed={sortMode === mode}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark ${
              sortMode === mode ? "bg-espresso text-ivory" : "text-espresso/70 hover:text-espresso"
            }`}
          >
            {mode === "latest" ? "Latest" : "Popular"}
          </button>
        ))}
      </div>

      {feedError && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {feedError}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <FeedCard key={`${sortMode}-${item.type}-${item.id}`} item={item} index={i % 20} onVote={handleVote} voting={votingIds.has(item.id)} />
        ))}
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-espresso/20 px-5 py-8 text-center text-sm text-espresso/70">
            Nothing here yet. Be the first!
          </p>
        )}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            aria-busy={loadingMore}
            className="rounded-full border border-espresso/25 px-6 py-2 text-sm font-medium text-espresso transition-colors hover:border-espresso hover:bg-espresso hover:text-ivory disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
