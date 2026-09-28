type User = { role: "member" | "moderator" | "admin"; blockedAt: string | null; createdAt: string; lastActiveAt: string | null };

const DAY_MS = 24 * 60 * 60 * 1000;

export function OverviewPanel({ users, now }: { users: User[]; now: number }) {
  const total = users.length;
  const active = users.filter((u) => !u.blockedAt).length;
  const byRole = { member: 0, moderator: 0, admin: 0 };
  for (const u of users) byRole[u.role]++;
  const activeLastWeek = users.filter((u) => u.lastActiveAt && now - Date.parse(u.lastActiveAt) < 7 * DAY_MS).length;
  const newLastMonth = users.filter((u) => now - Date.parse(u.createdAt) < 30 * DAY_MS).length;

  const stats = [
    { label: "Total users", value: total },
    { label: "Active (not blocked)", value: active },
    { label: "Active in last 7 days", value: activeLastWeek },
    { label: "New in last 30 days", value: newLastMonth },
    { label: "Admins", value: byRole.admin },
    { label: "Moderators", value: byRole.moderator },
    { label: "Members", value: byRole.member },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-ivory-linen bg-ivory-warm p-4 text-center">
          <p className="text-2xl font-semibold text-espresso">{s.value}</p>
          <p className="mt-1 text-xs text-espresso/55">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
