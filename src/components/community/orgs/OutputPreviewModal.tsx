"use client";

import { useEffect, useRef } from "react";
import type { RunFile } from "./OrgDetail";
import { RunFileViewer } from "./RunFileViewer";

export function OutputPreviewModal({ file, onClose }: { file: RunFile; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const newTabHref =
    file.fileType === "html"
      ? `/api/community/org-run-files/${file.id}`
      : `/community/org-run-files/${file.id}`;

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="output-preview-title"
        tabIndex={-1}
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-ivory-warm shadow-xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-ivory-linen px-5 py-3">
          <p id="output-preview-title" className="truncate text-sm font-medium text-espresso">
            {file.filename}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={newTabHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium text-espresso/70 hover:bg-ivory-linen hover:text-espresso"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path
                  d="M8 4H4.5A1.5 1.5 0 0 0 3 5.5v10A1.5 1.5 0 0 0 4.5 17h10a1.5 1.5 0 0 0 1.5-1.5V11M12 3h5v5M16.5 3.5 9 11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Open in new tab
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded p-1.5 text-espresso/55 hover:bg-ivory-linen hover:text-espresso"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <RunFileViewer file={file} />
        </div>
      </div>
    </div>
  );
}
