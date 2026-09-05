import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { ClipboardSim } from "@/components/demos/ClipboardSim";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MonoClip: Your clipboard, with a memory",
  description:
    "Cross-platform clipboard manager (macOS, Windows, Linux) with AI integration via MCP server. ~8MB binary, ~30MB RAM, blazing-fast search across your entire clip history.",
  alternates: { canonical: "/projects/mono-clip" },
};

export default function MonoClipPage() {
  const project = getProject("mono-clip");
  if (!project) notFound();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MonoClip",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "macOS, Windows, Linux",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Cross-platform clipboard manager (macOS, Windows, Linux) with AI integration via MCP server. ~8MB binary, ~30MB RAM, blazing-fast search across your entire clip history.",
    url: "https://monoes.me/projects/mono-clip",
    downloadUrl: "https://github.com/monoes/mono-clip",
    applicationSubCategory: "Clipboard Manager",
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    author: {
      "@type": "Organization",
      name: "Monoes",
      url: "https://monoes.me",
    },
  };

  return (
    <>
      <ProjectPageLayout project={project} demo={<ClipboardSim />} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
