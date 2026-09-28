"use client";

import { useState } from "react";
import { VoteButtons } from "@/components/community/VoteButtons";

/** Up/down votes on a library item page (library or gallery-org vote endpoint). */
export function ItemVotes({
  apiBase,
  initialScore,
  initialMyVote,
  loggedIn,
}: {
  apiBase: string;
  initialScore: number;
  initialMyVote: -1 | 0 | 1;
  loggedIn: boolean;
}) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState(initialMyVote);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function vote(value: -1 | 0 | 1) {
    if (!loggedIn) {
      setError("Log in to vote.");
      return;
    }
    setVoting(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        setError("Could not record your vote.");
        return;
      }
      const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
      setScore(data.score);
      setMyVote(data.myVote);
    } catch {
      setError("Something went wrong.");
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="flex items-center gap-3" data-testid="item-votes">
      <VoteButtons score={score} myVote={myVote} onVote={vote} voting={voting} />
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
