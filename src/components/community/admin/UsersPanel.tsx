"use client";

import { useState } from "react";

type User = {
  id: string;
  email: string;
  username: string | null;
  role: "member" | "moderator" | "admin";
  blockedAt: string | null;
  createdAt: string;
};

export function UsersPanel({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);

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

  async function changeRole(id: string, role: User["role"]) {
    const res = await fetch(`/api/community/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-ivory-linen">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory-parchment text-espresso/55">
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Joined</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-ivory-linen">
              <td className="px-4 py-2 text-espresso">{u.email}</td>
              <td className="px-4 py-2 text-espresso/70">{u.username ?? "—"}</td>
              <td className="px-4 py-2">
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as User["role"])}
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
              <td className="px-4 py-2 text-espresso/55">{new Date(u.createdAt).toLocaleDateString()}</td>
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
  );
}
