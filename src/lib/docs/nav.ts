import { ENDPOINT_GROUPS } from "./endpoint-registry";

export type NavItem = { label: string; href: string };
export type NavSection = { label: string; items: NavItem[] };

export const DOCS_NAV: NavSection[] = [
  {
    label: "Getting started",
    items: [
      { label: "Overview", href: "/docs" },
      { label: "Authentication & OAuth", href: "/docs/authentication" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Discovery", href: "/docs/discovery" },
      { label: "MCP server", href: "/docs/mcp" },
      { label: "Errors & conventions", href: "/docs/errors" },
    ],
  },
  {
    label: "API reference",
    items: [
      { label: "All endpoints", href: "/docs/reference" },
      ...ENDPOINT_GROUPS.map((g) => ({ label: g.name, href: `/docs/reference/${g.slug}` })),
    ],
  },
];
