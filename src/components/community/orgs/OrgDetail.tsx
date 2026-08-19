"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrgChart } from "./OrgChart";
import { RoleModal, type ModalRole } from "./RoleModal";

type Role = {
  id: string;
  title?: string;
  type?: string;
  reports_to?: string | null;
  responsibilities?: string[];
  adapter_config?: { model?: string };
  policy?: { git?: string };
};

export type OrgDetailData = {
  id: string;
  name: string;
  goal: string;
  topology: string | null;
  roles: Role[];
  orgJson: string;
  canDelete: boolean;
};

type Tab = "chart" | "roles";

function toModalRole(role: Role): ModalRole {
  return {
    id: role.id,
    title: role.title ?? role.id,
    type: role.type ?? "specialist",
    reports_to: role.reports_to ?? null,
    responsibilities: Array.isArray(role.responsibilities) ? role.responsibilities : [],
    model: role.adapter_config?.model,
    gitAccess: role.policy?.git,
  };
}

export function OrgDetail({ org }: { org: OrgDetailData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chart");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedRole = org.roles.find((r) => r.id === selectedRoleId);

  function handleDownload() {
    const blob = new Blob([org.orgJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${org.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/community/orgs/${org.id}`, { method: "DELETE" });
      if (!res.ok) {
        setDeleteError("Could not delete this org. Please try again.");
        setDeleting(false);
        return;
      }
      router.push("/community/orgs");
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <p className="font-medium text-espresso text-lg">{org.name}</p>
      {org.goal && <p className="mt-2 text-sm text-espresso/70">{org.goal}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2 border-b border-ivory-linen">
          {(["chart", "roles"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium ${
                tab === t ? "border-b-2 border-espresso text-espresso" : "text-espresso/55"
              }`}
            >
              {t === "chart" ? "Chart" : "Roles"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md border border-espresso/30 px-3 py-1.5 text-xs font-medium text-espresso hover:border-espresso"
          >
            Download
          </button>
          {org.canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-busy={deleting}
              className="rounded-md border border-red-700 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>

      {deleteError && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {deleteError}
        </p>
      )}

      <div className="mt-4">
        {tab === "chart" && (
          <OrgChart roles={org.roles.map((r) => ({ id: r.id, reports_to: r.reports_to ?? null }))} topology={org.topology} onSelectRole={setSelectedRoleId} />
        )}
        {tab === "roles" && (
          <div className="space-y-3">
            {org.roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className="block w-full rounded-lg border border-ivory-linen bg-ivory p-4 text-left transition-colors hover:border-espresso/30"
              >
                <p className="font-medium text-espresso">{role.title || role.id}</p>
                <p className="mt-1 text-xs text-espresso/55">
                  id: {role.id}
                  {role.reports_to ? ` · reports to: ${role.reports_to}` : ""}
                </p>
              </button>
            ))}
            {org.roles.length === 0 && <p className="text-sm text-espresso/55">No roles defined.</p>}
          </div>
        )}
      </div>

      {selectedRole && <RoleModal role={toModalRole(selectedRole)} onClose={() => setSelectedRoleId(null)} />}
    </div>
  );
}
