export function VoteButtons({
  score,
  myVote,
  onVote,
  voting,
}: {
  score: number;
  myVote: -1 | 0 | 1;
  onVote: (value: -1 | 0 | 1) => void;
  voting: boolean;
}) {
  function handleClick(clicked: 1 | -1) {
    onVote(myVote === clicked ? 0 : clicked);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleClick(1)}
        disabled={voting}
        aria-pressed={myVote === 1}
        aria-label="Upvote"
        aria-busy={voting}
        className={`rounded px-2 py-1 text-sm disabled:opacity-50 ${
          myVote === 1 ? "bg-espresso text-ivory" : "border border-espresso/30 text-espresso"
        }`}
      >
        ▲
      </button>
      <span className="text-sm font-semibold text-espresso">{score}</span>
      <button
        onClick={() => handleClick(-1)}
        disabled={voting}
        aria-pressed={myVote === -1}
        aria-label="Downvote"
        aria-busy={voting}
        className={`rounded px-2 py-1 text-sm disabled:opacity-50 ${
          myVote === -1 ? "bg-espresso text-ivory" : "border border-espresso/30 text-espresso"
        }`}
      >
        ▼
      </button>
    </div>
  );
}
