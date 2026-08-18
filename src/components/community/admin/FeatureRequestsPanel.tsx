"use client";

import { useState } from "react";

type Feature = {
  id: string;
  title: string;
  authorUsername: string | null;
  status: "open" | "planned" | "shipped" | "declined";
  score: number;
  createdAt: string;
};

const STATUS_OPTIONS: Feature["status"][] = ["open", "planned", "shipped", "declined"];

export function FeatureRequestsPanel({ initialFeatures }: { initialFeatures: Feature[] }) {
  const [features, setFeatures] = useState(initialFeatures);

  async function changeStatus(id: string, status: Feature["status"]) {
    const res = await fetch(`/api/community/features/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  }

  async function deleteFeature(id: string) {
    const res = await fetch(`/api/community/features/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  }

  const total = features.length;
  const byStatus = { open: 0, planned: 0, shipped: 0, declined: 0 };
  for (const f of features) byStatus[f.status]++;
  const topFive = [...features].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Total", value: total },
          { label: "Open", value: byStatus.open },
          { label: "Planned", value: byStatus.planned },
          { label: "Shipped", value: byStatus.shipped },
          { label: "Declined", value: byStatus.declined },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-ivory-linen bg-ivory-warm p-4 text-center">
            <p className="text-2xl font-semibold text-espresso">{s.value}</p>
            <p className="mt-1 text-xs text-espresso/55">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Top 5 by score</p>
      <div className="mb-6 overflow-x-auto rounded-lg border border-ivory-linen">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory-parchment text-espresso/55">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topFive.map((f) => (
              <tr key={f.id} className="border-t border-ivory-linen">
                <td className="px-4 py-2 text-espresso">{f.title}</td>
                <td className="px-4 py-2 text-espresso/70">{f.authorUsername ?? "—"}</td>
                <td className="px-4 py-2 text-espresso">{f.score}</td>
                <td className="px-4 py-2">
                  <select
                    value={f.status}
                    onChange={(e) => changeStatus(f.id, e.target.value as Feature["status"])}
                    className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteFeature(f.id)}
                    className="rounded border border-espresso/30 px-2 py-1 text-xs text-espresso transition-colors hover:border-espresso"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">All submissions</p>
      <div className="overflow-x-auto rounded-lg border border-ivory-linen">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory-parchment text-espresso/55">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Submitted</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.id} className="border-t border-ivory-linen">
                <td className="px-4 py-2 text-espresso">{f.title}</td>
                <td className="px-4 py-2 text-espresso/70">{f.authorUsername ?? "—"}</td>
                <td className="px-4 py-2 text-espresso">{f.score}</td>
                <td className="px-4 py-2">
                  <select
                    value={f.status}
                    onChange={(e) => changeStatus(f.id, e.target.value as Feature["status"])}
                    className="rounded border border-espresso/30 bg-transparent px-2 py-1 text-xs"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-espresso/55">{new Date(f.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteFeature(f.id)}
                    className="rounded border border-espresso/30 px-2 py-1 text-xs text-espresso transition-colors hover:border-espresso"
                  >
                    Delete
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
