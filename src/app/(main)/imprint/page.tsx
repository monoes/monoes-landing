import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Impressum und Unternehmensangaben der Nokhodian UG (haftungsbeschränkt).",
  alternates: { canonical: "/imprint" },
};

export default function ImprintPage() {
  return (
    <div className="bg-ivory" lang="de">
      <main className="px-6 md:px-12 lg:px-24 py-24 md:py-32 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-dark mb-6 block">
          Legal
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold text-espresso tracking-tight mb-12">
          Imprint / Impressum
        </h1>
        <div className="space-y-12 text-gold-bronze leading-relaxed font-light">
          <section>
            <h2 className="text-2xl font-semibold text-espresso mb-4">Unternehmensangaben</h2>
            <p className="font-semibold text-espresso">Nokhodian UG (haftungsbeschränkt)</p>
            <address className="not-italic mt-4">
              Bismarckstraße 10–12<br />
              10625 Berlin<br />
              Deutschland
            </address>
            <p className="mt-4">Geschäftsführer: Morteza Nokhodian</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-espresso mb-4">Handelsregister und Steuern</h2>
            <dl className="space-y-4">
              <div><dt className="font-semibold text-espresso">Handelsregister</dt><dd>HRB 206903B, Amtsgericht Berlin-Charlottenburg</dd></div>
              <div><dt className="font-semibold text-espresso">Steuernummer</dt><dd>29/457/31558</dd></div>
              <div><dt className="font-semibold text-espresso">USt-IdNr.</dt><dd>DE325814178</dd></div>
            </dl>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-espresso mb-4">Kontakt</h2>
            <a href="mailto:hello@nokhodian.com" className="text-gold-dark underline underline-offset-2 hover:text-espresso">
              hello@nokhodian.com
            </a>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-espresso mb-4">Verantwortlich für den Inhalt</h2>
            <p>Morteza Nokhodian, Bismarckstraße 10–12, 10625 Berlin.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-espresso mb-4">Haftung und Urheberrecht</h2>
            <p>
              Wir verantworten unsere eigenen Inhalte nach geltendem Recht. Für externe Inhalte
              sind deren Anbieter verantwortlich. Bei Kenntnis rechtswidriger Inhalte entfernen
              wir diese umgehend. Die Inhalte dieser Website unterliegen dem deutschen Urheberrecht;
              Nutzungen außerhalb der gesetzlichen Erlaubnisse erfordern die Zustimmung der Rechteinhaber.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-espresso mb-4">Streitbeilegung</h2>
            <p>
              Wir nehmen nicht an Verfahren vor einer Verbraucherschlichtungsstelle teil und
              sind hierzu nicht verpflichtet.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
