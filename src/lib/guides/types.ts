export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface GuideTable {
  columns: string[];
  rows: string[][];
}

export interface GuideLink {
  label: string;
  href: string;
}

/**
 * A long-form, answer-first page (comparison or buyer guide). `summary` is the
 * direct answer shown above the fold - it is what AI search engines quote, so
 * it must stand on its own and contain only verifiable claims.
 */
export interface Guide {
  slug: string;
  title: string;
  description: string;
  summary: string;
  updated: string;
  table?: GuideTable;
  sections: GuideSection[];
  faqs: GuideFaq[];
  related: GuideLink[];
}
