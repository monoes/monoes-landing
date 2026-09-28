"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KIND_LABEL, KIND_PATH, type Kind, type LibraryItem, type Visibility } from "@/lib/library/types";

const fieldClass =
  "w-full rounded-md border border-ivory-linen bg-ivory px-3 py-2 text-sm text-espresso focus:border-gold-dark focus:outline-none";

/** Kind from the file: .mpkg → automation; JSON with nodes → workflow, with roles → org. */
async function detectKind(file: File): Promise<Kind | null> {
  if (file.name.toLowerCase().endsWith(".mpkg")) return "automation";
  if (file.size > 20 * 1024 * 1024) return null;
  try {
    const json = JSON.parse(await file.text()) as Record<string, unknown>;
    if (Array.isArray(json.nodes)) return "workflow";
    if (Array.isArray(json.roles)) return "org";
  } catch {
    return null;
  }
  return null;
}

export function UploadForm({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<Kind | "">("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [version, setVersion] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    setFile(f);
    const detected = await detectKind(f);
    setKind(detected ?? "");
    if (!detected) setError("Couldn't tell what this file is. Pick its kind below.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !kind) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("kind", kind);
    form.set("visibility", visibility);
    form.set("file", file);
    if (name.trim()) form.set("name", name.trim());
    if (description.trim()) form.set("description", description.trim());
    if (tags.trim()) form.set("tags", tags);
    if (version.trim()) form.set("version", version.trim());
    try {
      const res = await fetch("/api/library/items", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as (LibraryItem & { error?: { message: string } }) | null;
      if (!res.ok || !data || data.error) {
        setError(data?.error?.message ?? `Upload failed (${res.status}).`);
        return;
      }
      router.push(`/library/${KIND_PATH[data.kind]}/${data.slug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-gold-dark bg-gold/10" : "border-espresso/20 bg-ivory hover:border-espresso/40"
        }`}
      >
        <input
          type="file"
          accept=".mpkg,.json,application/json,application/zip"
          className="sr-only"
          data-testid="library-file"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <span className="font-medium text-espresso">{file ? file.name : "Drop a file here, or click to choose"}</span>
        <span className="mt-1 text-sm text-espresso/60">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB${kind ? ` · ${KIND_LABEL[kind]}` : ""}`
            : "A web automation (.mpkg), a MonoAgent workflow export (.json) or an org (.json)"}
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm text-espresso/75">
          Kind
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} required className={fieldClass}>
            <option value="" disabled>
              Choose…
            </option>
            <option value="automation">Web automation</option>
            <option value="workflow">Workflow</option>
            <option value="org">Org</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm text-espresso/75">
          Visibility
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} className={fieldClass}>
            <option value="private">Private: only you</option>
            <option value="public">Public: anyone can find and install it</option>
            {isAdmin && <option value="official">Official</option>}
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-sm text-espresso/75">
        Name <span className="text-espresso/50">(optional; taken from the file)</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={fieldClass} />
      </label>
      <label className="grid gap-1 text-sm text-espresso/75">
        Description <span className="text-espresso/50">(optional)</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={3} className={fieldClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm text-espresso/75">
          Tags <span className="text-espresso/50">(comma-separated)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={fieldClass} />
        </label>
        {kind !== "automation" && (
          <label className="grid gap-1 text-sm text-espresso/75">
            Version <span className="text-espresso/50">(default 1.0.0)</span>
            <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" className={fieldClass} />
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={busy || !file || !kind}
          className="rounded-md bg-espresso px-5 py-2 text-sm font-medium text-ivory transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>
    </form>
  );
}
