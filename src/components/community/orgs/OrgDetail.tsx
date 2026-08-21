"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrgChart } from "./OrgChart";
import { RoleModal, type ModalRole } from "./RoleModal";
import { RunUploadForm } from "./RunUploadForm";
import { RunFileViewer } from "./RunFileViewer";

type Role = {
  id: string;
  title?: string;
  type?: string;
  reports_to?: string | null;
  responsibilities?: string[];
  adapter_config?: { model?: string };
  policy?: { git?: string; allowTools?: string[]; denyTools?: string[] };
};

export type RunFile = {
  id: string;
  filename: string;
  fileType: "md" | "html";
};

export type RunData = {
  id: string;
  label: string | null;
  uploaderUsername: string | null;
  createdAt: string;
  canDelete: boolean;
  files: RunFile[];
};

export type OrgDetailData = {
  id: string;
  name: string;
  goal: string;
  topology: string | null;
  roles: Role[];
  orgJson: string;
  canDelete: boolean;
  runs: RunData[];
  currentUsername: string | null;
};

type Tab = "chart" | "roles" | "outputs";

function toModalRole(role: Role): ModalRole {
  return {
    id: role.id,
    title: role.title ?? role.id,
    type: role.type ?? "specialist",
    reports_to: role.reports_to ?? null,
    responsibilities: Array.isArray(role.responsibilities) ? role.responsibilities : [],
    model: role.adapter_config?.model,
    gitAccess: role.policy?.git,
    allowToolsCount: role.policy?.allowTools?.length,
    denyToolsCount: role.policy?.denyTools?.length,
  };
}

export function OrgDetail({ org }: { org: OrgDetailData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chart");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedRunIds, setExpandedRunIds] = useState<Set<string>>(new Set());
  const [runDeleteError, setRunDeleteError] = useState<string | null>(null);
  const [deletingRunIds, setDeletingRunIds] = useState<Set<string>>(new Set());
  const [runs, setRuns] = useState(org.runs);
  const [viewingFile, setViewingFile] = useState<RunFile | null>(null);

  const selectedRole = org.roles.find((r) => r.id === selectedRoleId);

  function toggleRunExpanded(runId: string) {
    setExpandedRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) next.delete(runId);
      else next.add(runId);
      return next;
    });
  }

  async function handleDeleteRun(runId: string) {
    setRunDeleteError(null);
    setDeletingRunIds((prev) => new Set(prev).add(runId));
    try {
      const res = await fetch(`/api/community/orgs/${org.id}/runs/${runId}`, { method: "DELETE" });
      if (!res.ok) {
        setRunDeleteError("Could not delete this run. Please try again.");
        return;
      }
      setRuns((prev) => prev.filter((r) => r.id !== runId));
    } catch {
      setRunDeleteError("Something went wrong. Please try again.");
    } finally {
      setDeletingRunIds((prev) => {
        const next = new Set(prev);
        next.delete(runId);
        return next;
      });
    }
  }

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
          {(["chart", "roles", "outputs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium ${
                tab === t ? "border-b-2 border-espresso text-espresso" : "text-espresso/55"
              }`}
            >
              {t === "chart" ? "Chart" : t === "roles" ? "Roles" : "Outputs"}
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
                  {role.type ? ` · ${role.type}` : ""}
                </p>
                {role.responsibilities && role.responsibilities.length > 0 && (
                  <p className="mt-1 text-xs text-espresso/70">{role.responsibilities.slice(0, 2).join(" · ")}</p>
                )}
              </button>
            ))}
            {org.roles.length === 0 && <p className="text-sm text-espresso/55">No roles defined.</p>}
          </div>
        )}
        {tab === "outputs" && (
          <div>
            <RunUploadForm
              orgId={org.id}
              currentUsername={org.currentUsername}
              onUploaded={(run) => setRuns((prev) => [run, ...prev])}
            />
            {runDeleteError && (
              <p role="alert" className="mb-3 text-xs text-red-700">
                {runDeleteError}
              </p>
            )}
            <div className="space-y-3">
              {runs.map((run) => (
                <div key={run.id} className="rounded-lg border border-ivory-linen bg-ivory p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleRunExpanded(run.id)}
                      className="text-left text-sm text-espresso hover:underline"
                    >
                      {run.label || "Untitled run"} · {run.uploaderUsername ?? "unknown"} ·{" "}
                      {new Date(run.createdAt).toLocaleString()}
                    </button>
                    {run.canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRun(run.id)}
                        disabled={deletingRunIds.has(run.id)}
                        aria-busy={deletingRunIds.has(run.id)}
                        className="rounded-md border border-red-700 px-2 py-1 text-xs font-medium text-red-700 disabled:opacity-50"
                      >
                        {deletingRunIds.has(run.id) ? "Deleting…" : "Delete"}
                      </button>
                    )}
                  </div>
                  {expandedRunIds.has(run.id) && (
                    <ul className="mt-3 space-y-1">
                      {run.files.map((file) => (
                        <li key={file.id}>
                          <button
                            type="button"
                            onClick={() => setViewingFile(file)}
                            className="text-sm text-espresso/70 hover:text-espresso hover:underline"
                          >
                            {file.filename}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {runs.length === 0 && <p className="text-sm text-espresso/55">No outputs uploaded yet.</p>}
            </div>
            {viewingFile && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-espresso/55">{viewingFile.filename}</p>
                <RunFileViewer file={viewingFile} />
              </div>
            )}
          </div>
        )}
      </div>

      {selectedRole && <RoleModal role={toModalRole(selectedRole)} onClose={() => setSelectedRoleId(null)} />}
    </div>
  );
}
