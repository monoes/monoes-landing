export type BugLabelChip = {
  id: string;
  name: string;
  color: string;
};

export type Bug = {
  id: string;
  title: string;
  description: string;
  authorUsername: string | null;
  status: "open" | "in_progress" | "resolved" | "wontfix";
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  commentCount: number;
  labels: BugLabelChip[];
};

const STATUS_LABEL: Record<Bug["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  wontfix: "Won't fix",
};

const STATUS_COLOR: Record<Bug["status"], string> = {
  open: "text-espresso/70",
  in_progress: "text-gold-dark",
  resolved: "text-green-700",
  wontfix: "text-red-700",
};

const SEVERITY_LABEL: Record<Bug["severity"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const SEVERITY_COLOR: Record<Bug["severity"], string> = {
  low: "text-espresso/55",
  medium: "text-gold-dark",
  high: "text-orange-600",
  critical: "text-red-700",
};

const DESCRIPTION_TRUNCATE_LENGTH = 200;

export function BugCard({ bug }: { bug: Bug }) {
  const isLong = bug.description.length > DESCRIPTION_TRUNCATE_LENGTH;
  const displayedDescription = isLong ? `${bug.description.slice(0, DESCRIPTION_TRUNCATE_LENGTH)}…` : bug.description;

  return (
    <a
      href={`/community/bugs/${bug.id}`}
      className="block rounded-lg border border-ivory-linen bg-ivory p-5 transition-colors hover:border-espresso/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-espresso">{bug.title}</p>
          <p className="mt-1 text-sm text-espresso/70">{displayedDescription}</p>
          {bug.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {bug.labels.map((label) => (
                <span
                  key={label.id}
                  className="rounded px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-espresso/55">
            {bug.authorUsername ?? "unknown"} ·{" "}
            <span className={SEVERITY_COLOR[bug.severity]}>{SEVERITY_LABEL[bug.severity]}</span> ·{" "}
            <span className={STATUS_COLOR[bug.status]}>{STATUS_LABEL[bug.status]}</span> ·{" "}
            {bug.commentCount} comment{bug.commentCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </a>
  );
}
