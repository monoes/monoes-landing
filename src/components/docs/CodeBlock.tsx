"use client";

import { useState } from "react";
import { highlight, inferLang, type Lang } from "@/lib/docs/highlight";

export function CodeBlock({ code, label, lang }: { code: string; label?: string; lang?: Lang }) {
  const [copied, setCopied] = useState(false);
  const tokens = highlight(code, lang ?? inferLang(label, code));

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-gold/10 bg-espresso-deep shadow-soft">
      {label && (
        <div className="border-b border-gold/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-gold/60">
          {label}
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded border border-gold/20 bg-espresso-deep px-2 py-1 font-mono text-[11px] text-ivory/60 opacity-0 transition-opacity duration-200 ease-out hover:text-ivory focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-dark group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-ivory">
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={t.className}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
