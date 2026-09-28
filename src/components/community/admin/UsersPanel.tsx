"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PROVIDER_LABEL,
  filterAndSortUsers,
  formatRelativeTime,
  type AdminUserSummary,
  type UserFilter,
  type UserRole,
  type UserSort,
} from "@/lib/community/admin-users";

export function UsersPanel({ initialUsers, now }: { initialUsers: AdminUserSummary[]; now: number }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [sort, setSort] = useState<UserSort>("joined");

  async function toggleBlock(id: string, blocked: boolean) {
    const res = await fetch(`/api/community/admin/users/${id}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { blockedAt: string | null };
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blockedAt: data.blockedAt } : u)));
  }

  async function changeRole(id: string, role: UserRole) {
    const res = await fetch(`/api/community/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  const visible = filterAndSortUsers(users, { query, filter, sort });
  const controlClass = "rounded border border-espresso/30 bg-transparent px-2 py-1.5 text-sm text-espresso";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email, name, or username"
          aria-label="Search users"
          className={`${controlClass} min-w-0 flex-1`}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as UserFilter)} aria-label="Filter users" className={controlClass}>
          <option value="all">All users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="staff">Admins & moderators</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as UserSort)} aria-label="Sort users" className={controlClass}>
          <option value="joined">Newest first</option>
          <option value="active">Recently active</option>
          <option value="contributions">Most contributions</option>
        </select>
        <span className="text-xs text-espresso/55">
          {visible.length} of {users.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-ivory-linen">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory-parchment text-espresso/55">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Sign-in</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2">Last active</th>
              <th className="px-4 py-2 text-right">Contributions</th>
              <th className="px-4 py-2 text-right">Votes</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id} className="border-t border-ivory-linen">
                <td className="px-4 py-2">
                  <Link href={`/community/admin/users/${u.id}`} className="flex items-center gap-3 hover:underline">
                    {u.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- avatar bytes are served from our own R2-backed route or the OAuth provider
                      <img src={u.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ivory-parchment text-xs font-medium text-espresso/70">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block text-espresso">{u.name}</span>
                      <span className="block text-xs text-espresso/55">
                        {u.email}
                        {u.username ? ` · @${u.username}` : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2 text-xs text-espresso/70">
                  {u.providers.map((p) => PROVIDER_LABEL[p] ?? p).join(", ") || "—"}
                </td>
                <td className="px-4 py-2 text-espresso/55">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-espresso/55">{formatRelativeTime(u.lastActiveAt, now)}</td>
                <td className="px-4 py-2 text-right text-espresso">{u.contributionCount}</td>
                <td className="px-4 py-2 text-right text-espresso/70">{u.voteCount}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                    className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs"
                  >
                    <option value="member">member</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  {u.blockedAt ? (
                    <span className="text-red-700">blocked</span>
                  ) : (
                    <span className="text-espresso/70">active</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleBlock(u.id, !u.blockedAt)}
                    className="rounded border border-espresso/30 px-2 py-1 text-xs text-espresso transition-colors hover:border-espresso"
                  >
                    {u.blockedAt ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
