"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type FormValues = {
  name: string;
  tagline: string;
  description: string;
  body: string;
  bannerUrl: string | null;
};

export function OrgEditForm({ orgId, initial }: { orgId: string; initial: FormValues }) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function togglePreview() {
    if (!preview) {
      const { renderMarkdown } = await import("@/lib/community/render-markdown");
      setPreviewHtml(renderMarkdown(values.body));
    }
    setPreview((p) => !p);
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setBannerError(null);
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.set("image", file);
      const res = await fetch(`/api/community/orgs/${orgId}/images`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not upload image.");
        return;
      }
      const data = (await res.json()) as { url: string };
      const markdownImage = `![](${data.url})`;
      const cursor = bodyRef.current?.selectionStart ?? values.body.length;
      setValues((v) => ({
        ...v,
        body: v.body.slice(0, cursor) + markdownImage + v.body.slice(cursor),
        bannerUrl: data.url,
      }));

      const bannerRes = await fetch(`/api/community/orgs/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerUrl: data.url }),
      });
      if (!bannerRes.ok) {
        setBannerError("Image was uploaded but couldn't be set as the banner. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/community/orgs/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          tagline: values.tagline,
          description: values.description,
          body: values.body,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not save org.");
        return;
      }
      router.push(`/community/orgs/${orgId}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-1 block text-sm font-medium text-espresso">Banner</p>
        <p className="mb-2 text-xs text-espresso/55">
          Shown at the top of the org page. Uploading an image below sets this too.
        </p>
        {values.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external R2-backed URL, next/image adds no value here
          <img
            src={values.bannerUrl}
            alt=""
            className="h-32 w-full rounded-lg border border-ivory-linen object-cover"
          />
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-ivory-linen text-xs text-espresso/55">
            No banner yet
          </div>
        )}
        {bannerError && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            {bannerError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-espresso">
          Name
        </label>
        <input
          id="name"
          type="text"
          maxLength={100}
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm text-espresso"
        />
      </div>

      <div>
        <label htmlFor="tagline" className="mb-1 block text-sm font-medium text-espresso">
          Tagline ({values.tagline.length}/150)
        </label>
        <input
          id="tagline"
          type="text"
          maxLength={150}
          placeholder="One sentence — what does this org do?"
          value={values.tagline}
          onChange={(e) => setValues((v) => ({ ...v, tagline: e.target.value }))}
          className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm text-espresso"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-espresso">
          Description ({values.description.length}/1000)
        </label>
        <textarea
          id="description"
          maxLength={1000}
          rows={3}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          className="w-full rounded-md border border-espresso/30 px-3 py-2 text-sm text-espresso"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="body" className="block text-sm font-medium text-espresso">
            Body ({values.body.length}/20000)
          </label>
          <button
            type="button"
            onClick={togglePreview}
            className="text-xs font-medium text-espresso/70 hover:text-espresso"
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div
            className="markdown-body max-w-none rounded-md border border-ivory-linen bg-ivory p-3"
            // previewHtml is produced by renderMarkdown, which sanitizes via isomorphic-dompurify before this component ever receives it
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            id="body"
            ref={bodyRef}
            maxLength={20000}
            rows={16}
            placeholder="Write your org's story in Markdown. Use the button below to insert images."
            value={values.body}
            onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
            className="w-full rounded-md border border-espresso/30 px-3 py-2 font-mono text-sm text-espresso"
          />
        )}
        {!preview && (
          <label
            className="mt-2 inline-block cursor-pointer rounded-md border border-espresso/30 px-4 py-2 text-sm font-medium text-espresso transition-colors hover:border-espresso aria-disabled:opacity-50"
            aria-disabled={uploadingImage || saving}
          >
            {uploadingImage ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageSelect}
              disabled={uploadingImage || saving}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || uploadingImage}
        aria-busy={saving}
        className="w-full rounded-md bg-espresso px-5 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save org"}
      </button>
    </form>
  );
}
