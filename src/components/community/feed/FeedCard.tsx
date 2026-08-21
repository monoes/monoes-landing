import type { FeedItem } from "@/lib/community/feed";
import { VoteButtons } from "@/components/community/VoteButtons";

const TYPE_LABEL: Record<FeedItem["type"], string> = {
  post: "Post",
  bug: "Bug",
  feature: "Feature",
  org: "Org",
};

const TYPE_COLOR: Record<FeedItem["type"], string> = {
  post: "text-gold-dark",
  bug: "text-red-700",
  feature: "text-green-700",
  org: "text-espresso/70",
};

const DETAIL_PATH: Partial<Record<FeedItem["type"], string>> = {
  post: "posts",
  bug: "bugs",
  org: "orgs",
};

export function FeedCard({
  item,
  onVote,
  voting,
}: {
  item: FeedItem;
  onVote: (id: string, type: FeedItem["type"], value: -1 | 0 | 1) => void;
  voting: boolean;
}) {
  const detailSegment = DETAIL_PATH[item.type];
  const titleContent = (
    <>
      <span className={`mr-2 rounded px-1.5 py-0.5 text-xs font-medium ${TYPE_COLOR[item.type]} bg-espresso/5`}>
        {TYPE_LABEL[item.type]}
      </span>
      <span className="font-medium text-espresso">{item.title}</span>
    </>
  );

  return (
    <div className="rounded-lg border border-ivory-linen bg-ivory p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {detailSegment ? (
            <a href={`/community/${detailSegment}/${item.id}`} className="hover:underline">
              {titleContent}
            </a>
          ) : (
            <span>{titleContent}</span>
          )}
          <p className="mt-1 text-sm text-espresso/70">{item.preview}</p>
          <p className="mt-2 text-xs text-espresso/55">
            {item.authorUsername ?? "unknown"} · {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
        <VoteButtons
          score={item.score}
          myVote={item.myVote}
          onVote={(value) => onVote(item.id, item.type, value)}
          voting={voting}
        />
      </div>
    </div>
  );
}
