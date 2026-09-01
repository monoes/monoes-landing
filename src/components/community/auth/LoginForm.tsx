"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blocked = searchParams.get("blocked") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (signInError) {
        setError(signInError.message ?? "Invalid email or password.");
        return;
      }
      // When this login page was reached via an OAuth authorization request
      // (e.g. a local CLI/agent tool signing in), oauthProviderClient() (see
      // auth-client.ts) already attached the signed query to the request
      // above, and the server's response carries {redirect: true, url},
      // which better-auth's built-in redirect fetch-plugin auto-follows —
      // no extra handling needed here. Only plain sign-ins fall through.
      router.push("/community");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      {blocked && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          This account has been blocked. Contact an administrator if you believe this is a mistake.
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-espresso">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-espresso">
            Password
          </label>
          <Link href="/community/forgot-password" className="text-xs text-espresso/55 underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
