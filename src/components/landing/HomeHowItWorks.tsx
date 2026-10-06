const STEPS = [
  {
    n: "01",
    title: "Define the goal",
    body: "Tell Monomind the outcome, or tell Mono Agent the workflow.",
  },
  {
    n: "02",
    title: "It assembles the team — or the workflow",
    body: "Org Runtime v2 spins up the right roles; Mono Agent wires the right nodes.",
  },
  {
    n: "03",
    title: "Approve and run",
    body: "Human-in-the-loop where it matters, autonomous the rest of the way.",
  },
];

export function HomeHowItWorks() {
  return (
    <section className="bg-espresso px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">How it works</p>
        <h2 className="mb-14 max-w-xl text-3xl font-light leading-tight tracking-tight text-ivory md:text-4xl">
          The same three steps, whichever engine fits the work.
        </h2>
        <div className="grid gap-px overflow-hidden rounded-xl border border-gold/15 bg-gold/10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-espresso-deep/90 px-7 py-8">
              <span className="mb-4 block font-mono text-xs text-gold/50">{step.n}</span>
              <h3 className="mb-2.5 text-lg font-medium text-ivory">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ivory/55">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
