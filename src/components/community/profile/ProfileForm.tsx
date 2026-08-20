"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormValues = {
  tagline: string;
  jobTitle: string;
  company: string;
  tags: string[];
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  avatarUrl: string | null;
};

export function ProfileForm({ initial, username }: { initial: FormValues; username: string }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || values.tags.length >= 10 || values.tags.includes(tag)) return;
    setValues((v) => ({ ...v, tags: [...v.tags, tag] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setValues((v) => ({ ...v, tags: v.tags.filter((t) => t !== tag) }));
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("avatar", file);
      const res = await fetch("/api/community/profile/avatar", { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not upload avatar.");
        return;
      }
      const data = (await res.json()) as { avatarKey: string; updatedAt: string };
      setValues((v) => ({
        ...v,
        avatarUrl: `/api/images/avatar/${data.avatarKey}?v=${new Date(data.updatedAt).getTime()}`,
      }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/community/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagline: values.tagline,
          jobTitle: values.jobTitle,
          company: values.company,
          tags: values.tags,
          githubUrl: values.githubUrl,
          twitterUrl: values.twitterUrl,
          linkedinUrl: values.linkedinUrl,
          websiteUrl: values.websiteUrl,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not save profile.");
        return;
      }
      router.push(`/community/u/${username}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 block text-sm font-medium text-espresso">Avatar</p>
        <div className="flex items-center gap-4">
          {values.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- served from our own R2-backed route
            <img src={values.avatarUrl} alt="Current avatar" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-espresso/10" />
          )}
          <label
            className="cursor-pointer rounded-md border border-espresso/30 px-4 py-2 text-sm font-medium text-espresso transition-colors hover:border-espresso aria-disabled:opacity-50"
            aria-disabled={uploading || saving}
          >
            {uploading ? "Uploading…" : "Upload avatar"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarSelect}
              disabled={uploading || saving}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tagline" className="mb-1 block text-sm font-medium text-espresso">
            Tagline
          </label>
          <input
            id="tagline"
            type="text"
            maxLength={140}
            value={values.tagline}
            onChange={(e) => setValues((v) => ({ ...v, tagline: e.target.value }))}
            className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="jobTitle" className="mb-1 block text-sm font-medium text-espresso">
              Job title
            </label>
            <input
              id="jobTitle"
              type="text"
              maxLength={80}
              value={values.jobTitle}
              onChange={(e) => setValues((v) => ({ ...v, jobTitle: e.target.value }))}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-medium text-espresso">
              Company
            </label>
            <input
              id="company"
              type="text"
              maxLength={80}
              value={values.company}
              onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
              className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tag-input" className="mb-1 block text-sm font-medium text-espresso">
            Tags ({values.tags.length}/10)
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {values.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full bg-espresso/10 px-3 py-1 text-xs text-espresso hover:bg-espresso/20"
              >
                {tag} ×
              </button>
            ))}
          </div>
          <input
            id="tag-input"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            disabled={values.tags.length >= 10}
            placeholder="Type a tag and press Enter"
            className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="githubUrl" className="mb-1 block text-sm font-medium text-espresso">
            GitHub URL
          </label>
          <input
            id="githubUrl"
            type="url"
            value={values.githubUrl}
            onChange={(e) => setValues((v) => ({ ...v, githubUrl: e.target.value }))}
            placeholder="https://github.com/you"
            className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="twitterUrl" className="mb-1 block text-sm font-medium text-espresso">
            X / Twitter URL
          </label>
          <input
            id="twitterUrl"
            type="url"
            value={values.twitterUrl}
            onChange={(e) => setValues((v) => ({ ...v, twitterUrl: e.target.value }))}
            placeholder="https://x.com/you"
            className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="linkedinUrl" className="mb-1 block text-sm font-medium text-espresso">
            LinkedIn URL
          </label>
          <input
            id="linkedinUrl"
            type="url"
            value={values.linkedinUrl}
            onChange={(e) => setValues((v) => ({ ...v, linkedinUrl: e.target.value }))}
            placeholder="https://linkedin.com/in/you"
            className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium text-espresso">
            Website URL
          </label>
          <input
            id="websiteUrl"
            type="url"
            value={values.websiteUrl}
            onChange={(e) => setValues((v) => ({ ...v, websiteUrl: e.target.value }))}
            placeholder="https://you.dev"
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
          disabled={saving || uploading}
          aria-busy={saving}
          className="w-full rounded-md bg-espresso px-5 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
