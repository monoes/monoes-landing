import Link from "next/link";
import { discoveryPackages, discoveryContactEmail, discoveryEmailBody } from "@/lib/workforce";
import { hire, beliefs } from "@/content/home";
import { AutonomyDial } from "./AutonomyDial";

const mailto = (subject: string) =>
  `mailto:${discoveryContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(discoveryEmailBody)}`;

export function Hire() {
  return (
    <section id="hire" className="door door-two" aria-labelledby="hire-title">
      <div className="wrap">
        <header data-reveal>
          <p className="kicker">{hire.kicker}</p>
          <h2 id="hire-title">
            <span>{hire.title[0]}</span> <b>{hire.title[1]}</b>
          </h2>
          <p className="lede">{hire.body}</p>
        </header>
        <ul className="beliefs">
          {beliefs.map((b) => (
            <li key={b.title} data-reveal>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </li>
          ))}
        </ul>
        <div className="dial-wrap" data-reveal>
          <h3>{hire.dialTitle}</h3>
          <p>{hire.dialBody}</p>
          <AutonomyDial />
        </div>
        <ul className="packages">
          {discoveryPackages.map((pkg) => (
            <li key={pkg.id} data-reveal>
              <p className="pkg-price">{pkg.price}</p>
              <h3>{pkg.name}</h3>
              <p>{pkg.description}</p>
              <a className="btn btn-primary" href={mailto(pkg.mailSubject)}>
                Book {pkg.duration} Discovery <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="more" data-reveal>
          <Link href="/workforce">How Workforce works →</Link>
        </p>
      </div>
    </section>
  );
}
