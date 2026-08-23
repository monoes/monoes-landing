"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  "community:read": "Read your feed, bugs, orgs, posts, and votes",
  "community:write": "Post, comment, vote, and upload on your behalf",
};

export function OAuthConsentForm() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");
  const scope = searchParams.get("scope") ?? "";
  const scopes = scope.split(" ").filter(Boolean);

  const [clientName, setClientName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    authClient.oauth2
      .publicClient({ query: { client_id: clientId } })
      .then(({ data }) => setClientName((data as { name?: string } | null)?.name ?? null))
      .catch(() => setClientName(null));
  }, [clientId]);

  async function respond(accept: boolean) {
    setError(null);
    setSubmitting(true);
    try {
      const { data, error: consentError } = await authClient.oauth2.consent({ accept });
      if (consentError) {
        setError("Could not complete this request. Please try again.");
        return;
      }
      const redirectURI = (data as { redirectURI?: string } | null)?.redirectURI;
      if (redirectURI) {
        window.location.href = redirectURI;
      } else {
        setError("Could not complete this request. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
      <h1 className="mb-2 text-2xl font-semibold text-espresso tracking-tight">Authorize access</h1>
      <p className="mb-6 text-sm text-espresso/70">
        <span className="font-medium">{clientName ?? clientId ?? "This application"}</span> wants to:
      </p>
      <ul className="mb-6 space-y-2">
        {scopes.map((s) => (
          <li key={s} className="text-sm text-espresso/70">
            • {SCOPE_DESCRIPTIONS[s] ?? s}
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => respond(true)}
          disabled={submitting}
          aria-busy={submitting}
          className="flex-1 rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          Allow
        </button>
        <button
          type="button"
          onClick={() => respond(false)}
          disabled={submitting}
          className="flex-1 rounded-md border border-espresso/30 px-4 py-2 text-sm font-medium text-espresso disabled:opacity-50"
        >
          Deny
        </button>
      </div>
    </div>
  );
}
