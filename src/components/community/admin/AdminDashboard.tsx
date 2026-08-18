"use client";

import { useState } from "react";
import { OverviewPanel } from "./OverviewPanel";
import { UsersPanel } from "./UsersPanel";
import { FeatureRequestsPanel } from "./FeatureRequestsPanel";
import { PlaceholderPanel } from "./PlaceholderPanel";

type User = {
  id: string;
  email: string;
  username: string | null;
  role: "member" | "moderator" | "admin";
  blockedAt: string | null;
  createdAt: string;
};

type Feature = {
  id: string;
  title: string;
  authorUsername: string | null;
  status: "open" | "planned" | "shipped" | "declined";
  score: number;
  createdAt: string;
};

const TABS = ["Overview", "Users", "Feature requests", "Bug reports", "Forum", "Org gallery"] as const;

export function AdminDashboard({ users, features }: { users: User[]; features: Feature[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-ivory-linen">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t ? "border-b-2 border-espresso text-espresso" : "text-espresso/55"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && <OverviewPanel users={users} />}
      {tab === "Users" && <UsersPanel initialUsers={users} />}
      {tab === "Feature requests" && <FeatureRequestsPanel initialFeatures={features} />}
      {tab === "Bug reports" && <PlaceholderPanel title="Bug reports" phase={3} />}
      {tab === "Forum" && <PlaceholderPanel title="Forum" phase={4} />}
      {tab === "Org gallery" && <PlaceholderPanel title="Org gallery" phase={5} />}
    </div>
  );
}
