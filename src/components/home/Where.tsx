import { where } from "@/content/home";

export function Where() {
  return (
    <section className="where" aria-labelledby="where-title">
      <div className="wrap">
        <header data-reveal>
          <p className="kicker">{where.kicker}</p>
          <h2 id="where-title">
            <span>{where.title[0]}</span> <b>{where.title[1]}</b>
          </h2>
          <p className="lede">{where.lede}</p>
        </header>
        <div className="where-table" data-reveal>
          <div className="where-head" aria-hidden="true">
            <span />
            <span>{where.them}</span>
            <span className="us">{where.us}</span>
          </div>
          <dl className="where-rows">
            {where.rows.map((r) => (
              <div key={r.label} className="where-row">
                <dt>{r.label}</dt>
                <dd className="them">
                  <span className="where-tag">{where.them}</span>
                  {r.them}
                </dd>
                <dd className="us">
                  <span className="where-tag">{where.us}</span>
                  {r.us}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
