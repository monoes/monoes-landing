"use client";

import { useState } from "react";

export type Comment = {
  id: string;
  authorId: string;
  authorUsername: string | null;
  body: string;
  createdAt: string;
};

export function CommentSection({
  apiBasePath,
  initialComments,
  canModerate,
  currentUserId,
}: {
  apiBasePath: string;
  initialComments: Comment[];
  canModerate: boolean;
  currentUserId: string | null;
}) {
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommentError(null);
    setSubmittingComment(true);
    try {
      const res = await fetch(apiBasePath, {
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
    const res = await fetch(`${apiBasePath}/${commentId}`, { method: "DELETE" });
    if (!res.ok) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
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
        {comments.length === 0 && <p className="text-sm text-espresso/55">No comments yet.</p>}
      </div>

      {currentUserId ? (
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
      ) : (
        <p className="mt-4 text-sm text-espresso/55">Log in to leave a comment.</p>
      )}
    </div>
  );
}
