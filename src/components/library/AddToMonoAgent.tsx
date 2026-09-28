"use client";

import { useState } from "react";
import type { Kind } from "@/lib/library/types";

/** The "Add to MonoAgent" box: the exact CLI command, copyable, plus the monoagent:// link. */
export function AddToMonoAgent({ kind, id }: { kind: Kind; id: string }) {
  const command = `monoagentcli library install ${kind} ${id}`;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="add-to-monoagent"
        className="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-dark"
      >
        Add to MonoAgent
      </button>
      {open && (
        <div id="add-to-monoagent" className="mt-3 rounded-lg border border-ivory-linen bg-ivory p-4">
          <p className="text-sm text-espresso/75">Run this on the machine where MonoAgent is installed:</p>
          <div className="mt-2 flex items-stretch gap-2">
            <code
              data-testid="install-command"
              className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md bg-espresso-deep px-3 py-2 font-mono text-[13px] text-ivory"
            >
              {command}
            </code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-md border border-espresso/20 px-3 text-sm text-espresso transition-colors hover:border-espresso/40"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-3 text-xs text-espresso/55">
            Or{" "}
            <a href={`monoagent://library/install?kind=${kind}&id=${encodeURIComponent(id)}`} className="text-gold-dark hover:underline">
              open it in MonoAgent
            </a>{" "}
            if your version handles monoagent:// links. Private items need <code className="font-mono">monoagentcli library login</code> first.
          </p>
        </div>
      )}
    </div>
  );
}
