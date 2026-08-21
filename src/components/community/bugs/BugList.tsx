"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BugCard, type Bug } from "./BugCard";

type StatusFilter = "all" | Bug["status"];
type SortMode = "newest" | "oldest";

function isStatusFilter(value: string | null): value is StatusFilter {
  return value === "all" || value === "open" || value === "in_progress" || value === "resolved" || value === "wontfix";
}

function isSortMode(value: string | null): value is SortMode {
  return value === "newest" || value === "oldest";
}

function filterAndSortBugs(bugs: Bug[], statusFilter: StatusFilter, labelFilter: string, sortMode: SortMode): Bug[] {
  return bugs
    .filter((b) => statusFilter === "all" || b.status === statusFilter)
    .filter((b) => !labelFilter || b.labels.some((l) => l.id === labelFilter))
    .sort((a, b) =>
      sortMode === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function BugList({
  initialBugs,
  availableLabels,
  currentUsername,
}: {
  initialBugs: Bug[];
  availableLabels: { id: string; name: string }[];
  currentUsername: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bugs, setBugs] = useState(initialBugs);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const param = searchParams.get("status");
    return isStatusFilter(param) ? param : "all";
  });
  const [labelFilter, setLabelFilter] = useState<string>(() => searchParams.get("label") ?? "");
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    const param = searchParams.get("sort");
    return isSortMode(param) ? param : "newest";
  });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Bug["severity"]>("medium");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());
  const [voteError, setVoteError] = useState<string | null>(null);

  async function handleVote(id: string, value: -1 | 0 | 1) {
    if (votingIds.has(id)) return;
    setVoteError(null);
    setVotingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/community/bugs/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        setVoteError("Could not record your vote. Please try again.");
        return;
      }
      const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
      setBugs((prev) => prev.map((b) => (b.id === id ? { ...b, score: data.score, myVote: data.myVote } : b)));
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

  function updateQuery(next: { status?: StatusFilter; label?: string; sort?: SortMode }) {
    const params = new URLSearchParams();
    const status = next.status ?? statusFilter;
    const label = next.label ?? labelFilter;
    const sort = next.sort ?? sortMode;
    if (status !== "all") params.set("status", status);
    if (label) params.set("label", label);
    if (sort !== "newest") params.set("sort", sort);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  function handleStatusChange(value: StatusFilter) {
    setStatusFilter(value);
    updateQuery({ status: value });
  }

  function handleLabelChange(value: string) {
    setLabelFilter(value);
    updateQuery({ label: value });
  }

  function handleSortChange(value: SortMode) {
    setSortMode(value);
    updateQuery({ sort: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, severity }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setFormError(data.error ?? "Could not submit bug report.");
        return;
      }
      const created = (await res.json()) as {
        id: string;
        title: string;
        description: string;
        status: Bug["status"];
        severity: Bug["severity"];
        createdAt: string;
      };
      setBugs((prev) => [
        {
          id: created.id,
          title: created.title,
          description: created.description,
          authorUsername: currentUsername,
          status: created.status,
          severity: created.severity,
          createdAt: created.createdAt,
          commentCount: 0,
          labels: [],
          score: 0,
          myVote: 0,
        },
        ...prev,
      ]);
      setTitle("");
      setDescription("");
      setSeverity("medium");
      setShowForm(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = filterAndSortBugs(bugs, statusFilter, labelFilter, sortMode);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
            aria-label="Filter by status"
            className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="wontfix">Won&apos;t fix</option>
          </select>
          <select
            value={labelFilter}
            onChange={(e) => handleLabelChange(e.target.value)}
            aria-label="Filter by label"
            className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs"
          >
            <option value="">All labels</option>
            {availableLabels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
          {(["newest", "oldest"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleSortChange(mode)}
              className={`rounded px-3 py-1 text-xs font-medium ${
                sortMode === mode ? "bg-espresso text-ivory" : "border border-espresso/30 text-espresso"
              }`}
            >
              {mode === "newest" ? "Newest" : "Oldest"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80"
        >
          {showForm ? "Cancel" : "Report a bug"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-ivory-linen bg-ivory p-5">
          <div>
            <label htmlFor="bug-title" className="mb-1 block text-sm font-medium text-espresso">
              Title
            </label>
            <input
              id="bug-title"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="bug-description" className="mb-1 block text-sm font-medium text-espresso">
              Description
            </label>
            <textarea
              id="bug-description"
              required
              maxLength={1000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="bug-severity" className="mb-1 block text-sm font-medium text-espresso">
              Severity
            </label>
            <select
              id="bug-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Bug["severity"])}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
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
        {filtered.map((b) => (
          <BugCard key={b.id} bug={b} onVote={handleVote} voting={votingIds.has(b.id)} />
        ))}
        {filtered.length === 0 && <p className="text-sm text-espresso/55">No bug reports match these filters.</p>}
      </div>
    </div>
  );
}
