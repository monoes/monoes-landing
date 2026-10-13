import type { SpecRow } from "@/lib/build-first-content";

const STATUS_STYLE: Record<SpecRow["status"], string> = {
  Pass: "border-ivory/40 text-ivory",
  Fail: "border-gold text-gold",
  "Not run": "border-ivory/20 text-ivory/60",
};

export function SpecTable({ rows, caption }: { rows: SpecRow[]; caption: string }) {
  return (
    <figure className="m-0">
      <div
        role="region"
        aria-label="Example Acceptance Spec, scrolls sideways on small screens"
        tabIndex={0}
        className="overflow-x-auto rounded-2xl border border-ivory/15 bg-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-ivory/15 text-ivory/70">
              <th scope="col" className="px-4 py-3 font-mono text-xs font-medium">ID</th>
              <th scope="col" className="px-4 py-3 font-medium">Requirement</th>
              <th scope="col" className="px-4 py-3 font-medium">Test steps</th>
              <th scope="col" className="px-4 py-3 font-medium">Expected result</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-ivory/10 align-top last:border-0">
                <th scope="row" className="px-4 py-4 font-mono text-xs font-medium text-gold">{row.id}</th>
                <td className="px-4 py-4 text-ivory">{row.requirement}</td>
                <td className="px-4 py-4 text-ivory/75">{row.steps}</td>
                <td className="px-4 py-4 text-ivory/75">{row.expected}</td>
                <td className="px-4 py-4">
                  <span className={`inline-block rounded-full border px-3 py-1 font-mono text-xs ${STATUS_STYLE[row.status]}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-4 text-sm text-ivory/70">{caption}</figcaption>
    </figure>
  );
}
