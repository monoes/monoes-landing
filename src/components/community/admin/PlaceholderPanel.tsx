export function PlaceholderPanel({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="rounded-lg border border-dashed border-espresso/30 bg-ivory-warm p-8 text-center">
      <p className="text-sm font-medium text-espresso">{title}</p>
      <p className="mt-1 text-xs text-espresso/55">Coming in Phase {phase}.</p>
    </div>
  );
}
