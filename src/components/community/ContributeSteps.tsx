const steps = [
  { icon: "◎", title: "Pick a project", description: "Find one that matches your skills — Go, Rust, or TypeScript." },
  { icon: "◈", title: "Find an issue", description: "Look for \"good first issue\" labels or open a discussion." },
  { icon: "◉", title: "Ship it", description: "Fork, branch, PR — we review fast and merge faster." },
];

export function ContributeSteps() {
  return (
    <section className="bg-ivory px-8 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-8 text-xs uppercase tracking-label text-gold">How to Contribute</p>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-ivory-linen bg-ivory-parchment p-6 text-center">
              <div className="mx-auto mb-3 text-2xl text-gold/60">{step.icon}</div>
              <h3 className="mb-1 font-medium text-espresso">{step.title}</h3>
              <p className="text-sm text-gold-bronze">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
