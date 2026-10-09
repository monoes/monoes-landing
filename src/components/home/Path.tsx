import { path } from "@/content/home";

export function Path() {
  return (
    <section className="path" aria-labelledby="path-title">
      <div className="wrap">
        <header data-reveal>
          <p className="kicker">{path.kicker}</p>
          <h2 id="path-title">
            <span>{path.title[0]}</span> <b>{path.title[1]}</b>
          </h2>
          <p className="lede">{path.lede}</p>
        </header>
        <ol className="path-steps">
          {path.phases.map((p, i) => (
            <li key={p.phase} style={{ "--i": i } as React.CSSProperties} data-reveal>
              <span className="path-time">{p.timeline}</span>
              <h3>{p.phase}</h3>
              <p>{p.outcome}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
