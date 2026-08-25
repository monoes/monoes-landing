import Link from "next/link";
import { VoteButtons } from "@/components/community/VoteButtons";

export type Org = {
  id: string;
  name: string;
  goal: string;
  tagline: string | null;
  topology: string | null;
  roleCount: number;
  uploaderUsername: string | null;
  createdAt: string;
  score: number;
  myVote: -1 | 0 | 1;
};

export const TOPOLOGY_LABEL: Record<string, string> = {
  mesh: "Mesh",
  star: "Star",
  hierarchical: "Hierarchical",
};

export const TOPOLOGY_COLOR: Record<string, string> = {
  mesh: "text-gold-dark",
  star: "text-green-700",
  hierarchical: "text-espresso/70",
};

const GOAL_TRUNCATE_LENGTH = 150;

export function OrgCard({
  org,
  onVote,
  voting,
}: {
  org: Org;
  onVote: (id: string, value: -1 | 0 | 1) => void;
  voting: boolean;
}) {
  const topologyKey = Object.hasOwn(TOPOLOGY_LABEL, org.topology ?? "") ? (org.topology as string) : "hierarchical";
  const displayedGoal = org.goal.length > GOAL_TRUNCATE_LENGTH ? `${org.goal.slice(0, GOAL_TRUNCATE_LENGTH)}…` : org.goal;

  return (
    <div className="rounded-lg border border-ivory-linen bg-ivory p-5 transition-colors hover:border-espresso/30">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/community/orgs/${org.id}`} className="min-w-0 flex-1">
          <p className="font-medium text-espresso">{org.name}</p>
          {org.tagline && <p className="mt-1 text-sm font-medium text-gold-dark">{org.tagline}</p>}
          {displayedGoal && <p className="mt-1 text-sm text-espresso/70">{displayedGoal}</p>}
          <p className="mt-2 text-xs text-espresso/55">
            {org.uploaderUsername ?? "unknown"} · {org.roleCount} role{org.roleCount === 1 ? "" : "s"} ·{" "}
            <span className={TOPOLOGY_COLOR[topologyKey] ?? "text-espresso/70"}>
              {TOPOLOGY_LABEL[topologyKey] ?? topologyKey}
            </span>{" "}
            · {new Date(org.createdAt).toLocaleDateString()}
          </p>
        </Link>
        <VoteButtons score={org.score} myVote={org.myVote} onVote={(value) => onVote(org.id, value)} voting={voting} />
      </div>
    </div>
  );
}
