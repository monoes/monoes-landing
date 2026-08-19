type Bug = {
  id: string;
  title: string;
  authorUsername: string | null;
  status: "open" | "in_progress" | "resolved" | "wontfix";
  severity: "low" | "medium" | "high" | "critical";
  commentCount: number;
  labels: { id: string; name: string; color: string }[];
  createdAt: string;
};

export function BugReportsPanel({ bugs }: { bugs: Bug[] }) {
  const total = bugs.length;
  const byStatus = { open: 0, in_progress: 0, resolved: 0, wontfix: 0 };
  for (const b of bugs) byStatus[b.status]++;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Total", value: total },
          { label: "Open", value: byStatus.open },
          { label: "In progress", value: byStatus.in_progress },
          { label: "Resolved", value: byStatus.resolved },
          { label: "Won't fix", value: byStatus.wontfix },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-ivory-linen bg-ivory-warm p-4 text-center">
            <p className="text-2xl font-semibold text-espresso">{s.value}</p>
            <p className="mt-1 text-xs text-espresso/55">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">All bug reports</p>
      <div className="overflow-x-auto rounded-lg border border-ivory-linen">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory-parchment text-espresso/55">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Severity</th>
              <th className="px-4 py-2">Labels</th>
              <th className="px-4 py-2">Comments</th>
              <th className="px-4 py-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((b) => (
              <tr key={b.id} className="border-t border-ivory-linen">
                <td className="px-4 py-2 text-espresso">
                  <a href={`/community/bugs/${b.id}`} className="hover:underline">
                    {b.title}
                  </a>
                </td>
                <td className="px-4 py-2 text-espresso/70">{b.authorUsername ?? "—"}</td>
                <td className="px-4 py-2 text-espresso/70">{b.status}</td>
                <td className="px-4 py-2 text-espresso/70">{b.severity}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {b.labels.map((label) => (
                      <span key={label.id} className="rounded px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: label.color }}>
                        {label.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 text-espresso/70">{b.commentCount}</td>
                <td className="px-4 py-2 text-espresso/55">{new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
