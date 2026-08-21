"use client";

import { useState } from "react";
import type { RunData } from "./OrgDetail";

export function RunUploadForm({
  orgId,
  currentUsername,
  onUploaded,
}: {
  orgId: string;
  currentUsername: string | null;
  onUploaded: (run: RunData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fileInput = e.currentTarget.elements.namedItem("files") as HTMLInputElement;
    const files = fileInput.files;
    if (!files || files.length === 0) {
      setError("Select at least one .md or .html file.");
      return;
    }

    const formData = new FormData();
    formData.set("label", label);
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/orgs/${orgId}/runs`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not upload output files.");
        return;
      }
      const created = (await res.json()) as {
        id: string;
        label: string | null;
        createdAt: string;
        files: { id: string; filename: string; fileType: "md" | "html"; sizeBytes: number }[];
      };
      onUploaded({
        id: created.id,
        label: created.label,
        uploaderUsername: currentUsername,
        createdAt: created.createdAt,
        canDelete: true,
        files: created.files.map((f) => ({ id: f.id, filename: f.filename, fileType: f.fileType })),
      });
      setLabel("");
      fileInput.value = "";
      setOpen(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80"
      >
        {open ? "Cancel" : "Upload output"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-ivory-linen bg-ivory p-5">
          <div>
            <label htmlFor="run-label" className="mb-1 block text-sm font-medium text-espresso">
              Label (optional)
            </label>
            <input
              id="run-label"
              type="text"
              maxLength={100}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="run-files" className="mb-1 block text-sm font-medium text-espresso">
              Files (.md, .html — up to 10, 2 MB each)
            </label>
            <input
              id="run-files"
              name="files"
              type="file"
              multiple
              accept=".md,.html"
              className="w-full text-sm"
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
            {submitting ? "Uploading…" : "Upload"}
          </button>
        </form>
      )}
    </div>
  );
}
