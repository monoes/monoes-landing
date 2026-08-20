"use client";

import { useEffect, useRef } from "react";

export type ModalRole = {
  id: string;
  title: string;
  type: string;
  reports_to: string | null;
  responsibilities: string[];
  model?: string;
  gitAccess?: string;
  allowToolsCount?: number;
  denyToolsCount?: number;
};

export function RoleModal({ role, onClose }: { role: ModalRole; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
        tabIndex={-1}
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-ivory p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p id="role-modal-title" className="font-medium text-espresso">
              {role.title || role.id}
            </p>
            <p className="mt-1 text-xs text-espresso/55">
              id: {role.id} · {role.type}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 py-1 text-sm text-espresso/55 hover:text-espresso"
          >
            ×
          </button>
        </div>

        {role.reports_to && (
          <p className="mb-3 text-xs text-espresso/70">
            Reports to: <span className="text-espresso">{role.reports_to}</span>
          </p>
        )}

        {role.model && (
          <p className="mb-3 text-xs text-espresso/70">
            Model: <span className="text-espresso">{role.model}</span>
          </p>
        )}

        {role.gitAccess && (
          <p className="mb-3 text-xs text-espresso/70">
            Git access: <span className="text-espresso">{role.gitAccess}</span>
          </p>
        )}

        {(role.allowToolsCount !== undefined || role.denyToolsCount !== undefined) && (
          <p className="mb-3 text-xs text-espresso/70">
            Tools: <span className="text-espresso">{role.allowToolsCount ?? 0} allowed, {role.denyToolsCount ?? 0} denied</span>
          </p>
        )}

        {role.responsibilities.length > 0 && (
          <div>
            <p className="mb-1 text-xs uppercase tracking-label text-gold-dark font-medium">Responsibilities</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-espresso/70">
              {role.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
