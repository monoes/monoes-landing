import type { Metadata } from "next";
import { ReadingProgress } from "@/components/research/ReadingProgress";
import { ResearchHero } from "@/components/research/ResearchHero";
import { TwoEnginesSection } from "@/components/research/TwoEnginesSection";
import { OperatingModel } from "@/components/research/OperatingModel";
import { CentralizedArch } from "@/components/research/CentralizedArch";
import { OperationsEngine } from "@/components/research/OperationsEngine";
import { RiskFramework } from "@/components/research/RiskFramework";
import { MonomindInfra } from "@/components/research/MonomindInfra";
import { RoadmapSection } from "@/components/research/RoadmapSection";

export const metadata: Metadata = {
  title: "White Paper: The One-Person Company (Monoes)",
  description:
    "A framework for centralized agentic operation. One person, two execution engines, no fixed task ceiling. Run it yourself, or hire Monoes Workforce to run it for you.",
};

export default function WhitepaperPage() {
  return (
    <main>
      <ReadingProgress />
      <ResearchHero />
      <TwoEnginesSection />
      <OperatingModel />
      <CentralizedArch />
      <OperationsEngine />
      <RiskFramework />
      <MonomindInfra />
      <RoadmapSection />
    </main>
  );
}
