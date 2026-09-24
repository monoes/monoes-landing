import type { Metadata } from "next";
import { COMPARISONS } from "@/lib/guides";
import { GuideIndex } from "@/components/guides/GuideIndex";

export const metadata: Metadata = {
  title: "Comparisons: Mono Agent, Monomind and Monoes vs alternatives",
  description: "Honest, side-by-side comparisons of Monoes products with n8n, Make, Zapier, UiPath, CrewAI, LangGraph and Claude Code - including when the other tool is the better choice.",
  alternates: { canonical: "/compare" },
};

export default function Page() {
  return (
    <GuideIndex
      heading="Monoes comparisons"
      intro="Honest, side-by-side comparisons of Monoes products with n8n, Make, Zapier, UiPath, CrewAI, LangGraph and Claude Code - including when the other tool is the better choice."
      basePath="/compare"
      guides={COMPARISONS}
    />
  );
}
