import type { Fact } from "@/content/monomind-architecture";

export interface Card {
  label: string;
  value: string;
  desc: string;
}

export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="font-mono text-[0.92em] bg-espresso/5 rounded px-1 py-px">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  accent,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  accent: string;
}) {
  return (
    <>
      <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>
        {eyebrow}
      </p>
      <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">{title}</h2>
      <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
        <Rich text={intro} />
      </p>
    </>
  );
}

export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <div className="flex flex-col gap-4">
      {facts.map((f) => (
        <div
          key={f.badge}
          className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5 items-start"
          style={{ borderLeft: `4px solid ${f.color}` }}
        >
          <div className="text-xl font-black min-w-[40px] text-center" style={{ color: f.color }}>
            {f.badge}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-espresso mb-1">
              <Rich text={f.title} />
            </h4>
            <p className="text-sm text-espresso/60 leading-relaxed">
              <Rich text={f.body} />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FactCards({ items, accent }: { items: Card[]; accent: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f) => (
        <div key={f.label} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
          <p className="text-[10px] uppercase tracking-label font-bold mb-2" style={{ color: accent }}>
            {f.label}
          </p>
          <p className="text-base font-semibold text-espresso mb-2">{f.value}</p>
          <p className="text-xs text-espresso/55 leading-relaxed">
            <Rich text={f.desc} />
          </p>
        </div>
      ))}
    </div>
  );
}
