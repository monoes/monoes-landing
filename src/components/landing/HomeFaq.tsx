"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is this secure?",
    a: "Self-hosted means your data stays on your own infrastructure by default — memory and embeddings are local SQLite, not a managed cloud vector DB. Workforce engagements add human-in-the-loop approval on anything consequential.",
  },
  {
    q: "What does it cost?",
    a: "Monomind and Mono Agent are free and open source (Apache-2.0 and MIT). Monoes Workforce starts with a priced Discovery audit — $3,000 for one day, $12,000 for five — no open-ended billing.",
  },
  {
    q: "Do I need to replace my CRM or ERP?",
    a: "No. Workforce connects to the systems you already run. It's not a rip-and-replace — implementation pricing is scoped after the Discovery audit, once we know exactly what you're connecting to.",
  },
  {
    q: "Is this a chatbot?",
    a: "No. An agent org or a Mono Agent workflow executes the process end-to-end — it doesn't draft a suggestion and hand it back to you.",
  },
];

export function HomeFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-espresso px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Questions</p>
        <h2 className="mb-10 text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl">
          Before you ask.
        </h2>
        <div className="flex flex-col divide-y divide-gold/15 border-y border-gold/15">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-medium text-ivory">{item.q}</span>
                  <span className="shrink-0 font-mono text-gold">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-ivory/55">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
