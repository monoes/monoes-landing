const POINTS = [
  {
    title: "Self-hosted, not rented",
    body: "Run it on your own infrastructure. No seat licenses, no vendor lock-in, no account to lose access to.",
  },
  {
    title: "Local SQLite memory",
    body: "Persistent memory and embeddings live in SQLite on your own machine — not a managed cloud vector DB.",
  },
  {
    title: "Zero cloud dependency",
    body: "Monomind and Mono Agent are both fully offline-capable, aside from the AI model calls you choose to make.",
  },
];

export function HomeSecurity() {
  return (
    <section className="bg-espresso px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Where this differs</p>
        <h2 className="mb-4 max-w-2xl text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl">
          Relevance AI and Lindy run in their cloud. This runs in yours.
        </h2>
        <p className="mb-14 max-w-xl text-sm text-ivory/50">
          That&apos;s the one claim here that&apos;s true of Monoes and false of both named
          competitors — said plainly, not as a footnote.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title}>
              <h3 className="mb-2 text-base font-medium text-ivory">{p.title}</h3>
              <p className="text-sm leading-relaxed text-ivory/55">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
