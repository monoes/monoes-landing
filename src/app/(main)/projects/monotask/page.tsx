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

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MonoTask",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Linux, macOS, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Local-first P2P kanban with no server and no account. Boards in SQLite, synced via Automerge CRDTs over iroh QUIC. Works offline.",
    url: "https://monoes.me/projects/monotask",
    downloadUrl: "https://github.com/monoes/monotask",
    applicationSubCategory: "Project Management",
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    author: {
      "@type": "Organization",
      name: "Monoes",
      url: "https://monoes.me",
    },
  };

  return (
    <>
      <ProjectPageLayout project={project} demo={<KanbanSync />} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
