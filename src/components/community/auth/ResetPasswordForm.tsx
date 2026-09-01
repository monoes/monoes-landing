"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tk = searchParams.get("token");
  const invalidLink = searchParams.get("error") === "INVALID_TOKEN";
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw !== confirmPw) {
      setError("Those don't match.");
      return;
    }
    if (!tk) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: resetError } = await authClient.resetPassword({ newPassword: pw, token: tk });
      if (resetError) {
        setError(resetError.message ?? "This reset link is invalid or has expired.");
        return;
      }
      router.push("/community/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (invalidLink || !tk) {
    return (
      <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        This reset link is invalid or has expired.{" "}
        <Link href="/community/forgot-password" className="underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-espresso">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-espresso">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
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
        className="w-full rounded-md bg-espresso px-5 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {submitting ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
