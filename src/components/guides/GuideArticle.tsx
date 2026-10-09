import Link from "next/link";
import type { Guide } from "@/lib/guides/types";

interface GuideArticleProps {
  guide: Guide;
  section: { label: string; href: string };
}

export function GuideArticle({ guide, section }: GuideArticleProps) {
  const url = `https://monoes.me${section.href}/${guide.slug}`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      dateModified: new Date(guide.updated).toISOString(),
      author: { "@type": "Organization", name: "Monoes", url: "https://monoes.me" },
      publisher: {
        "@type": "Organization",
        name: "Monoes",
        logo: { "@type": "ImageObject", url: "https://monoes.me/images/logo-512.png" },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Monoes", item: "https://monoes.me" },
        { "@type": "ListItem", position: 2, name: section.label, item: `https://monoes.me${section.href}` },
        { "@type": "ListItem", position: 3, name: guide.title, item: url },
      ],
    },
  ];

  return (
    <article className="min-h-screen bg-ivory pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-gold-bronze uppercase">
            <Link href={section.href} className="hover:text-gold-dark transition-colors">
              {section.label}
            </Link>
            <span>/</span>
            <span>Updated {guide.updated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso tracking-tight leading-tight">
            {guide.title}
          </h1>
          <p className="text-lg sm:text-xl text-espresso/90 leading-relaxed p-6 rounded-xl bg-ivory-parchment border border-gold/30">
            {guide.summary}
          </p>
        </header>

        {guide.table && (
          <div className="overflow-x-auto rounded-xl border border-gold/30">
            <table className="w-full text-sm text-left text-espresso">
              <thead className="bg-espresso-deep text-ivory">
                <tr>
                  {guide.table.columns.map((col) => (
                    <th key={col} scope="col" className="px-4 py-3 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.table.rows.map((row) => (
                  <tr key={row[0]} className="border-t border-ivory-linen even:bg-ivory-warm">
                    {row.map((cell, idx) =>
                      idx === 0 ? (
                        <th key={idx} scope="row" className="px-4 py-3 font-semibold align-top">
                          {cell}
                        </th>
                      ) : (
                        <td key={idx} className="px-4 py-3 align-top">
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {guide.sections.map((s) => (
          <section key={s.heading} className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-espresso tracking-tight">{s.heading}</h2>
            {s.paragraphs?.map((p, idx) => (
              <p key={idx} className="text-base sm:text-lg text-espresso/90 leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="space-y-2 text-base text-espresso/90 list-disc pl-6">
                {s.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="space-y-6 pt-8 border-t border-ivory-linen">
          <h2 className="text-2xl sm:text-3xl font-bold text-espresso tracking-tight">
            Frequently asked questions
          </h2>
          {guide.faqs.map((faq) => (
            <div key={faq.question} className="space-y-2">
              <h3 className="text-lg font-bold text-espresso">{faq.question}</h3>
              <p className="text-base text-espresso/90 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </section>

        <nav className="pt-8 border-t border-ivory-linen space-y-3" aria-label="Related pages">
          <div className="text-xs font-mono text-gold-bronze uppercase">Related</div>
          <ul className="flex flex-wrap gap-3">
            {guide.related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block px-4 py-2 rounded-full border border-gold/30 text-sm text-gold-dark hover:bg-gold-pale transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </article>
  );
}
