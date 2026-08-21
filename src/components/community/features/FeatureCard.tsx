"use client";

import { useState } from "react";
import { VoteButtons } from "@/components/community/VoteButtons";

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
        <VoteButtons
          score={feature.score}
          myVote={feature.myVote}
          onVote={(value) => onVote(feature.id, value)}
          voting={voting}
        />
      </div>
    </div>
  );
}
