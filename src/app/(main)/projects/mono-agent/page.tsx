import Link from "next/link";
import { getProject } from "@/lib/projects";
import { ProjectPageLayout } from "@/components/projects/ProjectPageLayout";
import { WorkflowBuilder } from "@/components/demos/WorkflowBuilder";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMonoAgentVersion } from "@/lib/versions";
import { discoveryContactEmail, discoveryEmailBody, discoveryPackages } from "@/lib/workforce";

const DESCRIPTION =
  "Workflow automation with no AI credits: AI steps run on the agent CLI you already pay for (Claude Code, Codex and more). One Go binary, no Docker, 167 node types, human-in-the-loop approvals, an encrypted secrets vault, a visual editor and an MCP server for AI agents. Free of charge; monoes.me sign-in required.";

export const metadata: Metadata = {
  title: "Mono Agent: Local-first n8n alternative in a single Go binary",
  description: DESCRIPTION,
  alternates: { canonical: "/projects/mono-agent" },
};

const buildItMailto = `mailto:${discoveryContactEmail}?subject=${encodeURIComponent(
  "Monoes Workforce: build a Mono Agent automation",
)}&body=${encodeURIComponent(discoveryEmailBody)}`;

function HaveUsBuildIt() {
  return (
    <section className="bg-espresso px-4 sm:px-6 md:px-8 py-16 sm:py-20 border-t border-gold/15">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-xs uppercase tracking-label font-medium text-gold">Monoes Workforce</p>
        <h2 className="mb-4 text-2xl font-semibold text-ivory tracking-tight">
          Rather not build it yourself? Have us build it.
        </h2>
        <p className="mb-6 max-w-2xl text-ivory/70 font-light leading-relaxed">
          Monoes Workforce maps how the work runs today and builds the automations for you. Every
          engagement starts with a fixed-price Discovery, paid after delivery:
        </p>
        <ul className="mb-8 flex flex-wrap gap-3">
          {discoveryPackages.map((pkg) => (
            <li
              key={pkg.id}
              className="rounded-lg border border-gold/20 bg-espresso-deep/90 px-4 py-2 text-sm text-ivory/80"
            >
              {pkg.name} <span className="ml-1 font-semibold text-gold">{pkg.price}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/workforce"
            className="inline-flex items-center gap-2 bg-gold text-espresso font-semibold rounded-lg px-6 py-2.5 text-sm transition-opacity hover:opacity-90"
          >
            Have us build it →
          </Link>
          <a
            href={buildItMailto}
            className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-6 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
          >
            Email {discoveryContactEmail}
          </a>
        </div>
      </div>
    </section>
  );
}

export default async function MonoAgentPage() {
  const project = getProject("mono-agent");
  if (!project) notFound();
  const version = await getMonoAgentVersion();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Mono Agent",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: DESCRIPTION,
    url: "https://monoes.me/projects/mono-agent",
    downloadUrl: "https://github.com/monoes/mono-agent/releases/latest",
    ...(version && { softwareVersion: version }),
    applicationSubCategory: "Workflow Automation",
    author: {
      "@type": "Organization",
      name: "Monoes",
      url: "https://monoes.me",
    },
  };

  return (
    <>
      <ProjectPageLayout project={project} demo={<WorkflowBuilder />} cta={<HaveUsBuildIt />} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
