import Link from "next/link";
import { services } from "@/content/home";

export function Services() {
  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <div className="wrap">
        <header data-reveal>
          <p className="kicker">{services.kicker}</p>
          <h2 id="services-title">
            <span>{services.title[0]}</span> <b>{services.title[1]}</b>
          </h2>
          <p className="lede">{services.lede}</p>
        </header>
        <ul className="service-grid">
          {services.cards.map((card) => (
            <li key={card.id} data-reveal>
              <h3>{card.name}</h3>
              <p>{card.body}</p>
              <p className="service-pay">{card.pay}</p>
              <span className="service-links">
                {card.links.map((link) => (
                  <Link key={link.href + link.label} href={link.href}>
                    {link.label} <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
