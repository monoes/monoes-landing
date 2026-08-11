import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { ClipboardSim } from "@/components/demos/ClipboardSim";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MonoClip: Your clipboard, with a memory",
  description:
    "Native macOS clipboard manager with AI integration via MCP server. 8MB binary, ~30MB RAM, blazing-fast search across your entire clip history.",
  alternates: { canonical: "/projects/mono-clip" },
};

export default function MonoClipPage() {
  const project = getProject("mono-clip");
  if (!project) notFound();
  return <ProjectPageLayout project={project} demo={<ClipboardSim />} />;
}
