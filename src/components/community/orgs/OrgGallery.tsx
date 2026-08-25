"use client";

import { useState } from "react";
import { OrgCard, type Org } from "./OrgCard";

export function OrgGallery({
  initialOrgs,
  currentUsername,
}: {
  initialOrgs: Org[];
  currentUsername: string | null;
}) {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());
  const [voteError, setVoteError] = useState<string | null>(null);

  async function handleVote(id: string, value: -1 | 0 | 1) {
    if (votingIds.has(id)) return;
    setVoteError(null);
    setVotingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/community/orgs/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        setVoteError("Could not record your vote. Please try again.");
        return;
      }
      const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
      setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, score: data.score, myVote: data.myVote } : o)));
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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/community/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgJson: text }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setUploadError(data.error ?? "Could not upload org file.");
        return;
      }
      const created = (await res.json()) as {
        id: string;
        name: string;
        goal: string;
        topology: string | null;
        roleCount: number;
        createdAt: string;
      };
      setOrgs((prev) => [
        {
          id: created.id,
          name: created.name,
          goal: created.goal,
          tagline: null,
          topology: created.topology,
          roleCount: created.roleCount,
          uploaderUsername: currentUsername,
          createdAt: created.createdAt,
          score: 0,
          myVote: 0 as const,
        },
        ...prev,
      ]);
    } catch {
      setUploadError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <label
          className="cursor-pointer rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 aria-disabled:opacity-50"
          aria-disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload org JSON"}
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {uploadError && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {uploadError}
        </p>
      )}

      {voteError && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {voteError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {orgs.map((org) => (
          <OrgCard key={org.id} org={org} onVote={handleVote} voting={votingIds.has(org.id)} />
        ))}
        {orgs.length === 0 && <p className="text-sm text-espresso/55">No orgs uploaded yet. Be the first!</p>}
      </div>
    </div>
  );
}
