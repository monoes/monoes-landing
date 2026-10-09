import type { Guide } from "./types";
import { automationComparisons } from "./compare-automation";
import { agentComparisons } from "./compare-agents";
import { buyerGuides } from "./buyer-guides";

export const COMPARISONS: Guide[] = [...automationComparisons, ...agentComparisons];
export const GUIDES: Guide[] = buyerGuides;

export function findGuide(list: Guide[], slug: string): Guide | undefined {
  return list.find((g) => g.slug === slug);
}
