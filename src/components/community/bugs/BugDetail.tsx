"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_LABEL, SEVERITY_LABEL } from "./BugCard";

type Status = "open" | "in_progress" | "resolved" | "wontfix";
type Severity = "low" | "medium" | "high" | "critical";

export type BugLabel = { id: string; name: string; color: string };

export type Comment = {
  id: string;
  authorId: string;
  authorUsername: string | null;
  body: string;
  createdAt: string;
};

export type BugDetailData = {
  id: string;
  title: string;
  description: string;
  authorUsername: string | null;
  status: Status;
  severity: Severity;
  createdAt: string;
  labels: BugLabel[];
};

const STATUS_OPTIONS: Status[] = ["open", "in_progress", "resolved", "wontfix"];
const SEVERITY_OPTIONS: Severity[] = ["low", "medium", "high", "critical"];

export function BugDetail({
  bug,
  initialComments,
  allLabels,
  canModerate,
  currentUserId,
}: {
  bug: BugDetailData;
  initialComments: Comment[];
  allLabels: BugLabel[];
  canModerate: boolean;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(bug.status);
  const [severity, setSeverity] = useState(bug.severity);
  const [labels, setLabels] = useState(bug.labels);
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showNewLabelForm, setShowNewLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#a479e2");
  const [labelError, setLabelError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [triageError, setTriageError] = useState<string | null>(null);

  async function handleDeleteBug() {
    setDeleteError(null);
    const res = await fetch(`/api/community/bugs/${bug.id}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleteError("Could not delete this bug report. Please try again.");
      return;
    }
    setDeleted(true);
    router.push("/community/bugs");
  }

  async function handleStatusChange(next: Status) {
    const previous = status;
    setStatus(next);
    setTriageError(null);
    try {
      const res = await fetch(`/api/community/bugs/${bug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setStatus(previous);
        setTriageError("Could not update status. Please try again.");
      }
    } catch {
      setStatus(previous);
      setTriageError("Could not update status. Please try again.");
    }
  }

  async function handleSeverityChange(next: Severity) {
    const previous = severity;
    setSeverity(next);
    setTriageError(null);
    try {
      const res = await fetch(`/api/community/bugs/${bug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ severity: next }),
      });
      if (!res.ok) {
        setSeverity(previous);
        setTriageError("Could not update severity. Please try again.");
      }
    } catch {
      setSeverity(previous);
      setTriageError("Could not update severity. Please try again.");
    }
  }

  async function handleAttachLabel(label: BugLabel) {
    if (!label.id || labels.some((l) => l.id === label.id)) return;
    const res = await fetch(`/api/community/bugs/${bug.id}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelId: label.id }),
    });
    if (!res.ok) return;
    setLabels((prev) => [...prev, label]);
  }

  async function handleDetachLabel(labelId: string) {
    const res = await fetch(`/api/community/bugs/${bug.id}/labels/${labelId}`, { method: "DELETE" });
    if (!res.ok) return;
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
  }

  async function handleCreateLabel(e: React.FormEvent) {
    e.preventDefault();
    setLabelError(null);
    const res = await fetch("/api/community/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLabelName, color: newLabelColor }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setLabelError(data.error ?? "Could not create label.");
      return;
    }
    const created = (await res.json()) as BugLabel;
    router.refresh();
    await handleAttachLabel(created);
    setNewLabelName("");
    setShowNewLabelForm(false);
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommentError(null);
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/community/bugs/${bug.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setCommentError(data.error ?? "Could not post comment.");
        return;
      }
      const created = (await res.json()) as Comment;
      setComments((prev) => [...prev, created]);
      setCommentBody("");
    } catch {
      setCommentError("Something went wrong. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleCommentDelete(commentId: string) {
    const res = await fetch(`/api/community/bugs/${bug.id}/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div>
      <p className="font-medium text-espresso text-lg">{bug.title}</p>
      <p className="mt-2 text-sm text-espresso/70 whitespace-pre-wrap">{bug.description}</p>
      <p className="mt-2 text-xs text-espresso/55">{bug.authorUsername ?? "unknown"}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {labels.map((label) => (
          <span key={label.id} className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: label.color }}>
            {label.name}
            {canModerate && (
              <button type="button" onClick={() => handleDetachLabel(label.id)} aria-label={`Remove ${label.name} label`} className="ml-1">
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      {canModerate ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-ivory-linen bg-ivory-warm p-4">
          <label className="flex items-center gap-2 text-xs font-medium text-espresso">
            Status
            <select value={status} onChange={(e) => handleStatusChange(e.target.value as Status)} className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-espresso">
            Severity
            <select value={severity} onChange={(e) => handleSeverityChange(e.target.value as Severity)} className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs">
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {SEVERITY_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-espresso">
            Add label
            <select
              value=""
              onChange={(e) => {
                const label = allLabels.find((l) => l.id === e.target.value);
                if (label) handleAttachLabel(label);
              }}
              className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs"
            >
              <option value="">Select…</option>
              {allLabels
                .filter((l) => !labels.some((existing) => existing.id === l.id))
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </label>
          <button type="button" onClick={() => setShowNewLabelForm((v) => !v)} className="text-xs font-medium text-gold-dark hover:underline">
            + new label
          </button>
          {showNewLabelForm && (
            <form onSubmit={handleCreateLabel} className="flex items-center gap-2">
              <input
                type="text"
                required
                maxLength={30}
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="rounded border border-espresso/30 px-2 py-1 text-xs"
              />
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="h-7 w-10 rounded border border-espresso/30"
              />
              <button type="submit" className="rounded bg-espresso px-2 py-1 text-xs font-medium text-ivory">
                Create
              </button>
            </form>
          )}
          {labelError && (
            <p role="alert" className="w-full text-xs text-red-700">
              {labelError}
            </p>
          )}
          {triageError && (
            <p role="alert" className="w-full text-xs text-red-700">
              {triageError}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-espresso/55">
          Status: {STATUS_LABEL[status]} · Severity: {SEVERITY_LABEL[severity]}
        </p>
      )}

      {canModerate && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDeleteBug}
            disabled={deleted}
            aria-busy={deleted}
            className="rounded-md border border-red-700 px-3 py-1.5 text-xs font-medium text-red-700 transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {deleted ? "Deleting…" : "Delete bug report"}
          </button>
          {deleteError && (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {deleteError}
            </p>
          )}
        </div>
      )}

      <div className="mt-8">
        <p className="mb-3 text-xs uppercase tracking-label text-gold-dark font-medium">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </p>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-ivory-linen bg-ivory p-4">
              <p className="text-xs text-espresso/55">
                {c.authorUsername ?? "unknown"} · {new Date(c.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-espresso/70 whitespace-pre-wrap">{c.body}</p>
              {(canModerate || c.authorId === currentUserId) && (
                <button
                  type="button"
                  onClick={() => handleCommentDelete(c.id)}
                  className="mt-2 text-xs font-medium text-red-700 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleCommentSubmit} className="mt-4 space-y-2">
          <textarea
            required
            maxLength={1000}
            rows={3}
            placeholder="Add a comment…"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
          />
          {commentError && (
            <p role="alert" className="text-sm text-red-700">
              {commentError}
            </p>
          )}
          <button
            type="submit"
            disabled={submittingComment}
            aria-busy={submittingComment}
            className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {submittingComment ? "Posting…" : "Post comment"}
          </button>
        </form>
      </div>
    </div>
  );
}
