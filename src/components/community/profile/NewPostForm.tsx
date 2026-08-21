"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewPostForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not create post.");
        return;
      }
      setTitle("");
      setBody("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80"
      >
        {open ? "Cancel" : "New post"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-ivory-linen bg-ivory p-5">
          <div>
            <label htmlFor="post-title" className="mb-1 block text-sm font-medium text-espresso">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="post-body" className="mb-1 block text-sm font-medium text-espresso">
              Body
            </label>
            <textarea
              id="post-body"
              required
              maxLength={2000}
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post"}
          </button>
        </form>
      )}
    </div>
  );
}
