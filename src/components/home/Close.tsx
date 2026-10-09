import { close, hero } from "@/content/home";

export function Close() {
  return (
    <section className="close" aria-labelledby="close-title">
      <div className="close-sun" aria-hidden="true" />
      <div className="wrap" data-reveal>
        <h2 id="close-title">
          {close.lead} <b className="accent">{close.accent}</b>
        </h2>
        <p className="lede">{close.sub}</p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href={hero.primary.href} data-magnetic>
            {hero.primary.label} <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn-blue" href={hero.secondary.href} data-magnetic>
            {hero.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
