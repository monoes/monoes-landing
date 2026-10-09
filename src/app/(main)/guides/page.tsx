import type { Metadata } from "next";
import { GUIDES } from "@/lib/guides";
import { GuideIndex } from "@/components/guides/GuideIndex";

export const metadata: Metadata = {
  title: "Guides: agentic process automation, AI digital workers and local AI agents",
  description: "Answers to the questions operations, finance and engineering teams ask when automating business processes with AI agents.",
  alternates: { canonical: "/guides" },
};

export default function Page() {
  return (
    <GuideIndex
      heading="Guides to agentic process automation"
      intro="Answers to the questions operations, finance and engineering teams ask when automating business processes with AI agents."
      basePath="/guides"
      guides={GUIDES}
    />
  );
}
