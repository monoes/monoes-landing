import Link from "next/link";
import { capabilityCatalog } from "@/lib/workforce";
import { roster } from "@/content/home";

const workers = capabilityCatalog.flatMap((c) => c.agents.map((a) => a.replace(/ Agent$/, "")));
const total = workers.length;
const rows = [workers.filter((_, i) => i % 2 === 0), workers.filter((_, i) => i % 2 === 1)];

export function Roster() {
  return (
    <section className="roster" aria-labelledby="roster-title">
      <div className="wrap" data-reveal>
        <p className="kicker">{roster.kicker}</p>
        <h2 id="roster-title">
          <b>{capabilityCatalog.length} departments.</b> {total} named workers.
        </h2>
        <p className="lede">{roster.title}</p>
      </div>
      <div className="marquees" aria-hidden="true">
        {rows.map((row, r) => (
          <div key={r} className={`marquee${r ? " rev" : ""}`}>
            <div className="marquee-track">
              {[...row, ...row].map((w, i) => (
                <span key={i} className="chip">
                  {w}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="wrap roster-link" data-reveal>
        <Link href={roster.linkHref}>{roster.linkLabel} →</Link>
      </div>
    </section>
  );
}
