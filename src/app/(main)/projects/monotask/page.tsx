import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { KanbanSync } from "@/components/demos/KanbanSync";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MonoTask: P2P kanban with no server and no account",
  description:
    "Local-first kanban in Rust. Boards in SQLite, synced via Automerge CRDTs over iroh QUIC. Cryptographic invite tokens, works offline, nothing phones home.",
  alternates: { canonical: "/projects/monotask" },
};

export default function MonoTaskPage() {
  const project = getProject("monotask");
  if (!project) notFound();
  return <ProjectPageLayout project={project} demo={<KanbanSync />} />;
}
