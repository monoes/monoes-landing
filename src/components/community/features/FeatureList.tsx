"use client";

import { useState } from "react";
import { FeatureCard, type Feature } from "./FeatureCard";

type SortMode = "score" | "newest" | "oldest";

function sortFeatures(features: Feature[], mode: SortMode): Feature[] {
  const copy = [...features];
  if (mode === "score") {
    copy.sort((a, b) => b.score - a.score);
  } else if (mode === "newest") {
    copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return copy;
}

export function FeatureList({
  initialFeatures,
  currentUsername,
}: {
  initialFeatures: Feature[];
  currentUsername: string | null;
}) {
  const [features, setFeatures] = useState(initialFeatures);
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());
  const [voteError, setVoteError] = useState<string | null>(null);

  async function handleVote(id: string, value: -1 | 0 | 1) {
    if (votingIds.has(id)) return; // ignore clicks while a vote on this feature is in flight
    setVoteError(null);
    setVotingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/community/features/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        setVoteError("Could not record your vote. Please try again.");
        return;
      }
      const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
      setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, score: data.score, myVote: data.myVote } : f)));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setFormError(data.error ?? "Could not submit feature.");
        return;
      }
      const created = (await res.json()) as {
        id: string;
        title: string;
        description: string;
        status: Feature["status"];
        createdAt: string;
      };
      // Append the newly created feature to local state directly rather than
      // relying on router.refresh(): this component's `features` state was
      // seeded once from the `initialFeatures` prop via useState, and React
      // does not re-sync useState from new props on a parent re-render, so a
      // refresh() alone would silently fail to show the new submission here.
      setFeatures((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.title,
          description: created.description,
          authorUsername: currentUsername,
          status: created.status,
          createdAt: created.createdAt,
          score: 0,
          myVote: 0,
        },
      ]);
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const sorted = sortFeatures(features, sortMode);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["score", "newest", "oldest"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`rounded px-3 py-1 text-xs font-medium ${
                sortMode === mode ? "bg-espresso text-ivory" : "border border-espresso/30 text-espresso"
              }`}
            >
              {mode === "score" ? "Top" : mode === "newest" ? "Newest" : "Oldest"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80"
        >
          {showForm ? "Cancel" : "Suggest a feature"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-ivory-linen bg-ivory p-5">
          <div>
            <label htmlFor="feature-title" className="mb-1 block text-sm font-medium text-espresso">
              Title
            </label>
            <input
              id="feature-title"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="feature-description" className="mb-1 block text-sm font-medium text-espresso">
              Description
            </label>
            <textarea
              id="feature-description"
              required
              maxLength={1000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          {formError && (
            <p role="alert" className="text-sm text-red-700">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      )}

      {voteError && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {voteError}
        </p>
      )}

      <div className="space-y-3">
        {sorted.map((f) => (
          <FeatureCard key={f.id} feature={f} onVote={handleVote} voting={votingIds.has(f.id)} />
        ))}
        {sorted.length === 0 && <p className="text-sm text-espresso/55">No feature requests yet. Be the first!</p>}
      </div>
    </div>
  );
}
