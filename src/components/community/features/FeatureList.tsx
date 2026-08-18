"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeatureCard } from "./FeatureCard";

type Feature = {
  id: string;
  title: string;
  description: string;
  authorUsername: string | null;
  status: "open" | "planned" | "shipped" | "declined";
  createdAt: string;
  score: number;
  myVote: -1 | 0 | 1;
};

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

export function FeatureList({ initialFeatures }: { initialFeatures: Feature[] }) {
  const router = useRouter();
  const [features, setFeatures] = useState(initialFeatures);
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleVote(id: string, value: -1 | 0 | 1) {
    const res = await fetch(`/api/community/features/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, score: data.score, myVote: data.myVote } : f)));
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
      setTitle("");
      setDescription("");
      setShowForm(false);
      router.refresh();
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

      <div className="space-y-3">
        {sorted.map((f) => (
          <FeatureCard key={f.id} feature={f} onVote={handleVote} />
        ))}
        {sorted.length === 0 && <p className="text-sm text-espresso/55">No feature requests yet. Be the first!</p>}
      </div>
    </div>
  );
}
