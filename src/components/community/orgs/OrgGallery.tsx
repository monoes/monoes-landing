"use client";

import { useState } from "react";
import { OrgCard, type Org } from "./OrgCard";

export function OrgGallery({ initialOrgs }: { initialOrgs: Org[] }) {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
          topology: created.topology,
          roleCount: created.roleCount,
          uploaderUsername: null,
          createdAt: created.createdAt,
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {orgs.map((org) => (
          <OrgCard key={org.id} org={org} />
        ))}
        {orgs.length === 0 && <p className="text-sm text-espresso/55">No orgs uploaded yet. Be the first!</p>}
      </div>
    </div>
  );
}
