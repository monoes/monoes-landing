import Link from "next/link";
import type { Guide } from "@/lib/guides/types";

interface GuideIndexProps {
  heading: string;
  intro: string;
  basePath: string;
  guides: Guide[];
}

export function GuideIndex({ heading, intro, basePath, guides }: GuideIndexProps) {
  return (
    <main className="min-h-screen bg-ivory pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 space-y-10">
        <header className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso tracking-tight">{heading}</h1>
          <p className="text-lg text-espresso/90 leading-relaxed">{intro}</p>
        </header>
        <ul className="space-y-4">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`${basePath}/${guide.slug}`}
                className="block p-6 rounded-xl border border-gold/30 bg-ivory-warm hover:bg-gold-pale transition-colors"
              >
                <h2 className="text-xl font-bold text-espresso">{guide.title}</h2>
                <p className="mt-2 text-sm text-espresso/80 leading-relaxed">{guide.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
