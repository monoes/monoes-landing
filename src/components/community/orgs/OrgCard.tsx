export type Org = {
  id: string;
  name: string;
  goal: string;
  topology: string | null;
  roleCount: number;
  uploaderUsername: string | null;
  createdAt: string;
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

export function OrgCard({ org }: { org: Org }) {
  const topologyKey = Object.hasOwn(TOPOLOGY_LABEL, org.topology ?? "") ? (org.topology as string) : "hierarchical";
  const displayedGoal = org.goal.length > GOAL_TRUNCATE_LENGTH ? `${org.goal.slice(0, GOAL_TRUNCATE_LENGTH)}…` : org.goal;

  return (
    <a
      href={`/community/orgs/${org.id}`}
      className="block rounded-lg border border-ivory-linen bg-ivory p-5 transition-colors hover:border-espresso/30"
    >
      <p className="font-medium text-espresso">{org.name}</p>
      {displayedGoal && <p className="mt-1 text-sm text-espresso/70">{displayedGoal}</p>}
      <p className="mt-2 text-xs text-espresso/55">
        {org.uploaderUsername ?? "unknown"} · {org.roleCount} role{org.roleCount === 1 ? "" : "s"} ·{" "}
        <span className={TOPOLOGY_COLOR[topologyKey] ?? "text-espresso/70"}>
          {TOPOLOGY_LABEL[topologyKey] ?? topologyKey}
        </span>{" "}
        · {new Date(org.createdAt).toLocaleDateString()}
      </p>
    </a>
  );
}
