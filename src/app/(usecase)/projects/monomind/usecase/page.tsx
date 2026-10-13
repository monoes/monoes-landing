import type { Metadata } from "next";
import UsecaseDeck from "./UsecaseDeck";
import { getMonomindVersion } from "@/lib/versions";
import { getMonomindAgentCount } from "@/lib/monomind-catalog";

export const metadata: Metadata = {
  title: "Monomind use cases: a company that runs itself",
  description:
    "A walkthrough of what Monomind agent orgs do: build features from specs, read GitHub and ship, write the blog, and staff every department.",
  alternates: { canonical: "/projects/monomind/usecase" },
};

export default async function UsecasePage() {
  const [monomindVersion, agentCount] = await Promise.all([getMonomindVersion(), getMonomindAgentCount()]);
  return <UsecaseDeck monomindVersion={monomindVersion} agentCount={agentCount} />;
}
