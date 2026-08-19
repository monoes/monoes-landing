"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not set username.");
        return;
      }
      router.push("/community");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-espresso">
          Choose a username
        </label>
        <input
          id="username"
          type="text"
          required
          minLength={3}
          maxLength={24}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-describedby="username-hint"
          className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
        />
        <p id="username-hint" className="mt-1 text-xs text-espresso/55">
          3-24 characters: letters, numbers, underscore, hyphen.
        </p>
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
        className="w-full rounded-md bg-espresso px-5 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
