"use client";

import { useState } from "react";
import { OverviewPanel } from "./OverviewPanel";
import { UsersPanel } from "./UsersPanel";
import { FeatureRequestsPanel } from "./FeatureRequestsPanel";
import { BugReportsPanel } from "./BugReportsPanel";
import { OrgGalleryPanel } from "./OrgGalleryPanel";
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

type Org = {
  id: string;
  name: string;
  uploaderUsername: string | null;
  roleCount: number;
  topology: string | null;
  createdAt: string;
};

const TABS = ["Overview", "Users", "Feature requests", "Bug reports", "Forum", "Org gallery"] as const;

export function AdminDashboard({
  users,
  features,
  bugs,
  orgs,
}: {
  users: User[];
  features: Feature[];
  bugs: Bug[];
  orgs: Org[];
}) {
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
      {tab === "Bug reports" && <BugReportsPanel bugs={bugs} />}
      {tab === "Forum" && <PlaceholderPanel title="Forum" phase={4} />}
      {tab === "Org gallery" && <OrgGalleryPanel orgs={orgs} />}
    </div>
  );
}
