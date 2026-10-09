import { RevealHeading } from "./RevealHeading";

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
    <section className="bg-ivory px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-gold-dark">How it works</p>
        <RevealHeading
          as="h2"
          className="mb-20 max-w-xl text-3xl font-light leading-tight tracking-tight text-espresso md:text-4xl"
        >
          The same three steps, whichever engine fits the work.
        </RevealHeading>
        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-espresso/10 md:block" />
          {STEPS.map((step) => (
            <div key={step.n} className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 left-0 select-none text-[110px] font-light leading-none text-espresso/5"
              >
                {step.n}
              </span>
              <div className="relative z-10 pt-10">
                <div className="mb-4 h-2.5 w-2.5 rounded-full bg-gold-dark" />
                <h3 className="mb-2.5 text-lg font-medium text-espresso">{step.title}</h3>
                <p className="text-sm leading-relaxed text-espresso/55">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
