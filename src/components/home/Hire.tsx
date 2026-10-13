import Link from "next/link";
import { hire, beliefs } from "@/content/home";
import { AutonomyDial } from "./AutonomyDial";

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
        <p className="more" data-reveal>
          <Link href="/workforce">See Workforce and the Discovery audit →</Link>
        </p>
      </div>
    </section>
  );
}
