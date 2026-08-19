"use client";

import { useState } from "react";

const DESCRIPTION_TRUNCATE_LENGTH = 200;

export type Feature = {
  id: string;
  title: string;
  description: string;
  authorUsername: string | null;
  status: "open" | "planned" | "shipped" | "declined";
  createdAt: string;
  score: number;
  myVote: -1 | 0 | 1;
};

const STATUS_LABEL: Record<Feature["status"], string> = {
  open: "Open",
  planned: "Planned",
  shipped: "Shipped",
  declined: "Declined",
};

const STATUS_COLOR: Record<Feature["status"], string> = {
  open: "text-espresso/70",
  planned: "text-gold-dark",
  shipped: "text-green-700",
  declined: "text-red-700",
};

export function FeatureCard({
  feature,
  onVote,
  voting,
}: {
  feature: Feature;
  onVote: (id: string, value: -1 | 0 | 1) => void;
  voting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  function handleVoteClick(clicked: 1 | -1) {
    // clicking the already-active vote removes it; otherwise sets the new value
    onVote(feature.id, feature.myVote === clicked ? 0 : clicked);
  }

  const isLong = feature.description.length > DESCRIPTION_TRUNCATE_LENGTH;
  const displayedDescription =
    isLong && !expanded ? `${feature.description.slice(0, DESCRIPTION_TRUNCATE_LENGTH)}…` : feature.description;

  return (
    <div className="rounded-lg border border-ivory-linen bg-ivory p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-espresso">{feature.title}</p>
          <p className="mt-1 text-sm text-espresso/70">
            {displayedDescription}
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="ml-1 text-xs font-medium text-gold-dark hover:underline"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </p>
          <p className="mt-2 text-xs text-espresso/55">
            {feature.authorUsername ?? "unknown"} · <span className={STATUS_COLOR[feature.status]}>{STATUS_LABEL[feature.status]}</span>
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleVoteClick(1)}
            disabled={voting}
            aria-pressed={feature.myVote === 1}
            aria-label="Upvote"
            aria-busy={voting}
            className={`rounded px-2 py-1 text-sm disabled:opacity-50 ${
              feature.myVote === 1 ? "bg-espresso text-ivory" : "border border-espresso/30 text-espresso"
            }`}
          >
            ▲
          </button>
          <span className="text-sm font-semibold text-espresso">{feature.score}</span>
          <button
            onClick={() => handleVoteClick(-1)}
            disabled={voting}
            aria-pressed={feature.myVote === -1}
            aria-label="Downvote"
            aria-busy={voting}
            className={`rounded px-2 py-1 text-sm disabled:opacity-50 ${
              feature.myVote === -1 ? "bg-espresso text-ivory" : "border border-espresso/30 text-espresso"
            }`}
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
