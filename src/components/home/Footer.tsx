import Link from "next/link";
import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/social-links";

const groups = [
  {
    title: "Build",
    links: [
      { label: "Monomind", href: "/projects/monomind" },
      { label: "Mono Agent", href: "/projects/mono-agent" },
      { label: "MonoClip", href: "/projects/mono-clip" },
      { label: "MonoTask", href: "/projects/monotask" },
    ],
  },
  {
    title: "Hire",
    links: [
      { label: "Workforce", href: "/workforce" },
      { label: "How it works", href: "/workforce/how-it-works" },
      { label: "Capabilities", href: "/workforce/capabilities" },
    ],
  },
  {
    title: "Read",
    links: [
      { label: "Whitepaper", href: "/whitepaper" },
      { label: "Blog", href: "/blog" },
      { label: "Docs", href: "/docs" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Security", href: "/security" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-grid">
        <div className="lp-footer-brand">
          <Image
            className="lp-footer-logo"
            src="/images/logo-wordmark-light.svg"
            alt="Monoes"
            width={191}
            height={30}
          />
          <p>Autonomous AI teams. Run them free, or hire us to run them.</p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2>{g.title}</h2>
            <ul>
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ul className="lp-footer-social">
        {SOCIAL_LINKS.filter((s) => s.tier === "primary").map((s) => (
          <li key={s.id}>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
          </li>
        ))}
      </ul>
      <p className="lp-footer-fine">© {new Date().getFullYear()} Monoes</p>
    </footer>
  );
}
