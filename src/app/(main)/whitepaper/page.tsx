import type { Metadata } from "next";
import { ReadingProgress } from "@/components/research/ReadingProgress";
import { ResearchHero } from "@/components/research/ResearchHero";
import { OperatingModel } from "@/components/research/OperatingModel";
import { CentralizedArch } from "@/components/research/CentralizedArch";
import { RiskFramework } from "@/components/research/RiskFramework";
import { MonomindInfra } from "@/components/research/MonomindInfra";
import { RoadmapSection } from "@/components/research/RoadmapSection";

export const metadata: Metadata = {
  title: "White Paper: The One-Developer Company — Monoes",
  description:
    "A framework for centralized agentic software engineering. One engineer. One AI organization. Unlimited output.",
};

export default function WhitepaperPage() {
  return (
    <main>
      <ReadingProgress />
      <ResearchHero />
      <OperatingModel />
      <CentralizedArch />
      <RiskFramework />
      <MonomindInfra />
      <RoadmapSection />
    </main>
  );
}
