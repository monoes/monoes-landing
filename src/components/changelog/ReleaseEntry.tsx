import type { Release } from "@/lib/releases";
import { renderSafeMarkdown } from "@/lib/render-safe-markdown";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ReleaseEntry({ release }: { release: Release }) {
  const bodyHtml = release.body.trim() ? renderSafeMarkdown(release.body) : "";
  const showName = release.name !== release.tag && release.name !== `v${release.version}`;

  return (
    <article className="rounded-xl border border-gold/20 bg-ivory-warm p-5 sm:p-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-lg font-bold text-espresso">v{release.version}</h3>
        {release.prerelease && (
          <span className="rounded-full border border-gold/40 bg-gold-pale px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-gold-dark">
            Pre-release
          </span>
        )}
        {release.publishedAt && (
          <time dateTime={release.publishedAt} className="text-xs font-mono text-gold-bronze">
            {formatDate(release.publishedAt)}
          </time>
        )}
        <a
          href={release.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs font-mono text-gold-dark underline underline-offset-2 hover:text-espresso"
        >
          View on GitHub
        </a>
      </header>
      {showName && <p className="mt-1 text-sm text-espresso/70">{release.name}</p>}
      {bodyHtml && (
        <div
          className="markdown-body mt-4 max-w-none overflow-x-auto break-words"
          // bodyHtml is produced by renderMarkdown, which sanitizes via isomorphic-dompurify
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      )}
    </article>
  );
}
