"use client";

import { useState } from "react";
import Link from "next/link";
import { VoteButtons } from "@/components/community/VoteButtons";
import type { GalleryItem } from "@/lib/library/page-data";
import { KIND_PATH } from "@/lib/library/types";
import { goToLogin } from "@/lib/community/go-to-login";

const DESCRIPTION_TRUNCATE_LENGTH = 150;

function summary(item: GalleryItem): string {
  const m = item.meta as Record<string, unknown>;
  if (item.kind === "automation") {
    const domains = (m.site_domains as string[] | undefined) ?? [];
    const actions = (m.actions as string[] | undefined) ?? [];
    return [domains[0], `${actions.length} action${actions.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ");
  }
  const triggers = (m.trigger_types as string[] | undefined) ?? [];
  const nodes = (m.node_types as string[] | undefined) ?? [];
  return [triggers[0], `${nodes.length} node type${nodes.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ");
}

function GalleryCard({
  item,
  onVote,
  voting,
}: {
  item: GalleryItem;
  onVote: (id: string, value: -1 | 0 | 1) => void;
  voting: boolean;
}) {
  const description =
    item.description.length > DESCRIPTION_TRUNCATE_LENGTH
      ? `${item.description.slice(0, DESCRIPTION_TRUNCATE_LENGTH)}…`
      : item.description;
  return (
    <div className="rounded-lg border border-ivory-linen bg-ivory p-5 transition-colors hover:border-espresso/30">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/library/${KIND_PATH[item.kind]}/${item.slug}`} className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-medium text-espresso">
            {item.name}
            {item.visibility === "official" && (
              <span className="rounded border border-gold-dark/30 bg-gold/10 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gold-dark">
                Official
              </span>
            )}
          </p>
          {description && <p className="mt-1 text-sm text-espresso/70">{description}</p>}
          <p className="mt-2 text-xs text-espresso/55">
            {item.owner.username ?? item.owner.name} · v{item.version} · {summary(item)} ·{" "}
            {new Date(item.created_at).toLocaleDateString()}
          </p>
        </Link>
        <VoteButtons score={item.score} myVote={item.myVote} onVote={(value) => onVote(item.id, value)} voting={voting} />
      </div>
    </div>
  );
}

/** Workflow / web automation gallery: the org gallery's cards and voting, over library items. */
export function LibraryGallery({ initialItems, loggedIn }: { initialItems: GalleryItem[]; loggedIn: boolean }) {
  const [items, setItems] = useState(initialItems);
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());
  const [voteError, setVoteError] = useState<string | null>(null);

  async function handleVote(id: string, value: -1 | 0 | 1) {
    if (votingIds.has(id)) return;
    if (!loggedIn) {
      goToLogin();
      return;
    }
    setVoteError(null);
    setVotingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/community/library/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.status === 401) {
        goToLogin();
        return;
      }
      if (!res.ok) {
        setVoteError("Could not record your vote. Please try again.");
        return;
      }
      const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, score: data.score, myVote: data.myVote } : i)));
    } catch {
      setVoteError("Something went wrong. Please try again.");
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
      {voteError && (
        <p role="alert" className="mb-3 text-sm text-red-800">
          {voteError}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} onVote={handleVote} voting={votingIds.has(item.id)} />
        ))}
      </div>
    </div>
  );
}
