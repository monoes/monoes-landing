"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LibraryItem, Visibility } from "@/lib/library/types";

async function apiMessage(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  return data?.error?.message ?? `Request failed (${res.status}).`;
}

const fieldClass =
  "w-full rounded-md border border-ivory-linen bg-ivory px-3 py-2 text-sm text-espresso focus:border-gold-dark focus:outline-none";

/** Owner/admin controls on a library item page: edit, visibility, new version, delete. */
export function OwnerControls({
  item,
  canEdit,
  canDelete,
  isAdmin,
}: {
  item: LibraryItem;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [tags, setTags] = useState(item.tags.join(", "));
  const [visibility, setVisibility] = useState<Visibility>(item.visibility);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(action: () => Promise<Response>, done: string, after?: () => void) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await action();
      if (!res.ok) {
        setMessage({ ok: false, text: await apiMessage(res) });
        return;
      }
      setMessage({ ok: true, text: done });
      if (after) after();
      else router.refresh();
    } catch {
      setMessage({ ok: false, text: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    run(
      () =>
        fetch(`/api/library/items/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, tags, visibility }),
        }),
      "Saved.",
    );
  }

  function publishVersion(e: React.FormEvent) {
    e.preventDefault();
    if (!versionFile) return;
    const form = new FormData();
    form.set("file", versionFile);
    if (version.trim()) form.set("version", version.trim());
    run(() => fetch(`/api/library/items/${item.id}/artifact`, { method: "PUT", body: form }), "New version published.", () => {
      setVersionFile(null);
      setVersion("");
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Delete “${item.name}” and all its versions? This can't be undone.`)) return;
    run(() => fetch(`/api/library/items/${item.id}`, { method: "DELETE" }), "Deleted.", () => router.push("/library?tab=mine"));
  }

  const visibilities: Visibility[] = isAdmin ? ["private", "public", "official"] : ["private", "public"];

  return (
    <section aria-labelledby="owner-controls" className="mt-10 rounded-lg border border-ivory-linen bg-ivory p-5">
      <h2 id="owner-controls" className="text-base font-semibold text-espresso">
        Manage
      </h2>

      {canEdit && (
        <>
          <form onSubmit={save} className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm text-espresso/75">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required className={fieldClass} />
            </label>
            <label className="grid gap-1 text-sm text-espresso/75">
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={3} className={fieldClass} />
            </label>
            <label className="grid gap-1 text-sm text-espresso/75">
              Tags (comma-separated)
              <input value={tags} onChange={(e) => setTags(e.target.value)} className={fieldClass} />
            </label>
            <label className="grid gap-1 text-sm text-espresso/75">
              Visibility
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                disabled={item.visibility === "official" && !isAdmin}
                className={fieldClass}
              >
                {visibilities.map((v) => (
                  <option key={v} value={v}>
                    {v === "private" ? "Private: only you" : v === "public" ? "Public: anyone can find and install it" : "Official"}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-gold-dark disabled:opacity-50"
              >
                Save changes
              </button>
            </div>
          </form>

          <form onSubmit={publishVersion} className="mt-6 grid gap-3 border-t border-ivory-linen pt-5">
            <p className="text-sm font-medium text-espresso">Publish a new version</p>
            <input
              type="file"
              accept={item.kind === "automation" ? ".mpkg,application/zip" : ".json,application/json"}
              onChange={(e) => setVersionFile(e.target.files?.[0] ?? null)}
              aria-label="New version file"
              className="text-sm text-espresso/75"
            />
            {item.kind !== "automation" && (
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder={`Version (default: next patch after ${item.version})`}
                aria-label="Version"
                className={fieldClass}
              />
            )}
            <div>
              <button
                type="submit"
                disabled={busy || !versionFile}
                className="rounded-md border border-espresso/20 px-4 py-2 text-sm text-espresso transition-colors hover:border-espresso/40 disabled:opacity-50"
              >
                Upload version
              </button>
            </div>
          </form>
        </>
      )}

      {canDelete && (
        <div className="mt-6 border-t border-ivory-linen pt-5">
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-md border border-red-700/30 px-4 py-2 text-sm text-red-800 transition-colors hover:border-red-700/60 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      {message && (
        <p role="status" className={`mt-4 text-sm ${message.ok ? "text-green-800" : "text-red-800"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
