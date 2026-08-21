"use client";

import { useState } from "react";
import Link from "next/link";
import { VoteButtons } from "@/components/community/VoteButtons";

export type PostDetailData = {
  id: string;
  title: string;
  body: string;
  authorUsername: string | null;
  createdAt: string;
  score: number;
  myVote: -1 | 0 | 1;
};

export function PostDetail({ post }: { post: PostDetailData }) {
  const [score, setScore] = useState(post.score);
  const [myVote, setMyVote] = useState(post.myVote);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  async function handleVote(value: -1 | 0 | 1) {
    if (voting) return;
    setVoteError(null);
    setVoting(true);
    try {
      const res = await fetch(`/api/community/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        setVoteError("Could not record your vote. Please try again.");
        return;
      }
      const data = (await res.json()) as { score: number; myVote: -1 | 0 | 1 };
      setScore(data.score);
      setMyVote(data.myVote);
    } catch {
      setVoteError("Something went wrong. Please try again.");
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="rounded-lg border border-ivory-linen bg-ivory p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-espresso">{post.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-espresso/80">{post.body}</p>
          <p className="mt-4 text-xs text-espresso/55">
            {post.authorUsername ? (
              <Link href={`/community/u/${post.authorUsername}`} className="hover:underline">
                {post.authorUsername}
              </Link>
            ) : (
              "unknown"
            )}{" "}
            · {new Date(post.createdAt).toLocaleDateString()}
          </p>
          {voteError && (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {voteError}
            </p>
          )}
        </div>
        <VoteButtons score={score} myVote={myVote} onVote={handleVote} voting={voting} />
      </div>
    </div>
  );
}
