"use client";

import { useEffect, useState } from "react";
import type { RunFile } from "./OrgDetail";

export function RunFileViewer({ file }: { file: RunFile }) {
  const [markdownHtml, setMarkdownHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file.fileType !== "md") {
      setMarkdownHtml(null);
      return;
    }
    setError(null);
    setMarkdownHtml(null);
    fetch(`/api/community/org-run-files/${file.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then((raw) => {
        // The route already serves the raw markdown source; conversion +
        // sanitization happens here via the same renderMarkdown helper the
        // server uses, kept in sync by importing the identical function.
        import("@/lib/community/render-markdown").then(({ renderMarkdown }) => {
          setMarkdownHtml(renderMarkdown(raw));
        });
      })
      .catch(() => setError("Could not load this file."));
  }, [file.id, file.fileType]);

  if (file.fileType === "html") {
    return (
      <iframe
        src={`/api/community/org-run-files/${file.id}`}
        sandbox="allow-scripts"
        className="h-96 w-full rounded-lg border border-ivory-linen bg-ivory"
        title={file.filename}
      />
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (markdownHtml === null) {
    return <p className="text-sm text-espresso/55">Loading…</p>;
  }

  return (
    <div
      className="prose prose-sm max-w-none rounded-lg border border-ivory-linen bg-ivory p-5"
      // markdownHtml is produced by renderMarkdown, which sanitizes via isomorphic-dompurify before this component ever receives it
      dangerouslySetInnerHTML={{ __html: markdownHtml }}
    />
  );
}
