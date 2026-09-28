import type { FeedItem } from "@/lib/community/feed";
import { VoteButtons } from "@/components/community/VoteButtons";

const TYPE_LABEL: Record<FeedItem["type"], string> = {
  post: "Post",
  bug: "Bug",
  feature: "Feature",
  org: "Org",
  workflow: "Workflow",
  automation: "Web automation",
};

// Chip colors: a tint of each type's own hue, with its text at AA contrast.
const TYPE_STYLE: Record<FeedItem["type"], string> = {
  post: "bg-gold/15 text-gold-dark",
  bug: "bg-red-100 text-red-800",
  feature: "bg-green-100 text-green-800",
  org: "bg-espresso/10 text-espresso",
  workflow: "bg-gold-muted/15 text-[#7a5a28]",
  automation: "bg-gold-warm/20 text-[#74552c]",
};

// 14px line glyphs, one per type.
const TYPE_GLYPH: Record<FeedItem["type"], React.ReactNode> = {
  post: <path d="M3 4.5h10v6H7l-3 2.5v-2.5H3z" />,
  bug: <path d="M8 4.5a3 3 0 0 1 3 3V10a3 3 0 0 1-6 0V7.5a3 3 0 0 1 3-3zM5 8H2.5M13.5 8H11M5.5 4 4 2.5M10.5 4 12 2.5M8 7v5" />,
  feature: <path d="M8 2.5 9.3 6.2l3.7.3-2.9 2.3 1 3.7L8 10.4l-3.1 2.1 1-3.7L3 6.5l3.7-.3z" />,
  org: <path d="M8 2.2 13 5v6L8 13.8 3 11V5zM8 8v5.8M8 8l5-3M8 8 3 5" />,
  workflow: <path d="M4 4.5h3v3H4zM9 8.5h3v3H9zM7 6h1.5a1 1 0 0 1 1 1v1.5" />,
  automation: <path d="M2.5 3.5h11v8h-11zM2.5 5.8h11M7 8l3.5 1.5L9 10l-.5 1.5z" />,
};

const DETAIL_PATH: Partial<Record<FeedItem["type"], string>> = {
  post: "posts",
  bug: "bugs",
  org: "orgs",
};

// Deterministic (UTC) so server and client render the same text.
const DATE = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function initial(name: string | null): string {
  return (name?.trim()[0] ?? "?").toUpperCase();
}

export function FeedCard({
  item,
  index = 0,
  onVote,
  voting,
}: {
  item: FeedItem;
  index?: number;
  onVote: (id: string, type: FeedItem["type"], value: -1 | 0 | 1) => void;
  voting: boolean;
}) {
  const detailSegment = DETAIL_PATH[item.type];
  const href = item.url ?? (detailSegment ? `/community/${detailSegment}/${item.id}` : null);

  return (
    <article
      className="feed-card group relative rounded-lg border border-ivory-linen bg-ivory p-5 transition-[border-color,box-shadow] duration-300 hover:border-espresso/20 hover:shadow-soft-lg"
      style={{ "--i": Math.min(index, 10) } as React.CSSProperties}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-espresso/65">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${TYPE_STYLE[item.type]}`}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
                {TYPE_GLYPH[item.type]}
              </svg>
              {TYPE_LABEL[item.type]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-espresso text-[10px] font-semibold text-gold">
                {initial(item.authorUsername)}
              </span>
              {item.authorUsername ?? "unknown"}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={item.createdAt}>{DATE.format(new Date(item.createdAt))}</time>
          </div>
          <h3 className="mt-2 text-base font-medium text-espresso text-pretty sm:text-[17px]">
            {href ? (
              <a href={href} className="decoration-gold-dark/40 underline-offset-4 hover:underline focus-visible:underline">
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </h3>
          {item.preview && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-espresso/75">{item.preview}</p>}
        </div>
        <VoteButtons
          score={item.score}
          myVote={item.myVote}
          onVote={(value) => onVote(item.id, item.type, value)}
          voting={voting}
        />
      </div>
    </article>
  );
}
