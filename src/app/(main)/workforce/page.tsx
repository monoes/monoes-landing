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
};

export default function WorkforcePage() {
  return (
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
  );
}
