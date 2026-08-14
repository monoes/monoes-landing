import type { Metadata } from "next";
import { WorkforceHero } from "@/components/workforce/WorkforceHero";
import { ValueProps } from "@/components/workforce/ValueProps";
import { CapabilitiesGrid } from "@/components/workforce/CapabilitiesGrid";
import { HowItWorks } from "@/components/workforce/HowItWorks";
import { DiscoveryPackages } from "@/components/workforce/DiscoveryPackages";
import { FoundingClientProgram } from "@/components/workforce/FoundingClientProgram";
import { BookACall } from "@/components/workforce/BookACall";
import { PoweredByMonomind } from "@/components/workforce/PoweredByMonomind";

export const metadata: Metadata = {
  title: "Monoes Workforce: AI digital workers for your business processes",
  description:
    "Digital workers that execute your business processes end-to-end, on the ERP, CRM, and email you already run. Start with a priced Discovery audit.",
  alternates: { canonical: "/workforce" },
};

export default function WorkforcePage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Monoes Workforce",
    description:
      "AI digital workers that execute your business processes end-to-end on the ERP, CRM, and email systems you already run. Fully managed deployment and ongoing audit.",
    provider: {
      "@type": "Organization",
      name: "Monoes",
      url: "https://monoes.me",
      logo: "https://monoes.me/images/logo-512.png",
    },
    areaServed: "Worldwide",
    serviceType: "AI Process Automation",
    url: "https://monoes.me/workforce",
    offers: {
      "@type": "Offer",
      description: "Discovery audit starting at $4,500 for process mapping and ROI analysis",
    },
  };

  return (
    <>
      <main>
        <WorkforceHero />
        <ValueProps />
        <CapabilitiesGrid />
        <HowItWorks />
        <DiscoveryPackages />
        <FoundingClientProgram />
        <BookACall />
        <PoweredByMonomind />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
