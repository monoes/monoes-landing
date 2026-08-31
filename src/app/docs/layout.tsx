import type { Metadata } from "next";
import Link from "next/link";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { PageToc } from "@/components/docs/PageToc";

export const metadata: Metadata = {
  title: { default: "Monoes API docs", template: "%s · Monoes API docs" },
  description: "API and OAuth documentation for integrating with monoes.me.",
  robots: { index: true, follow: true },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ivory-linen bg-ivory/95 px-6 py-3 backdrop-blur-sm">
        <Link href="/docs" className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wide text-espresso">monoes</span>
          <span className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[11px] text-espresso/55">docs</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="/api/openapi.json"
            className="hidden text-espresso/60 hover:text-espresso sm:inline"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenAPI
          </a>
          <a
            href="https://github.com/monoes"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-espresso/60 hover:text-espresso sm:inline"
          >
            GitHub
          </a>
          <Link href="/" className="rounded-md border border-espresso/20 px-3 py-1.5 text-xs font-medium text-espresso hover:border-espresso">
            monoes.me →
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl md:gap-10 md:px-6">
        <DocsSidebar />
        <main id="docs-main" className="min-w-0 flex-1 px-6 py-10 md:px-0">
          {children}
        </main>
        <div className="py-10 pr-6">
          <PageToc />
        </div>
      </div>
    </div>
  );
}
