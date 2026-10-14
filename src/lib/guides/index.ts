import type { Guide } from "./types";
import { automationComparisons } from "./compare-automation";
import { agentComparisons } from "./compare-agents";
import { buyerGuides } from "./buyer-guides";
import { monoAgentGuides } from "./mono-agent-guides";

export const COMPARISONS: Guide[] = [...automationComparisons, ...agentComparisons];
export const GUIDES: Guide[] = [...buyerGuides, ...monoAgentGuides];

export function findGuide(list: Guide[], slug: string): Guide | undefined {
  return list.find((g) => g.slug === slug);
}
