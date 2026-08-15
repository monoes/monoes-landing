import Link from "next/link";
import Image from "next/image";

const footerSections = [
  {
    title: "Products",
    links: [
      { label: "Monomind", href: "/projects/monomind" },
      { label: "Mono Agent", href: "/projects/mono-agent" },
      { label: "MonoClip", href: "/projects/mono-clip" },
      { label: "MonoTask", href: "/projects/monotask" },
    ],
  },
  {
    title: "Workforce",
    links: [
      { label: "Overview", href: "/workforce" },
      { label: "How it works", href: "/workforce/how-it-works" },
      { label: "Capabilities", href: "/workforce/capabilities" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Whitepaper", href: "/whitepaper" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Open source",
    links: [
      { label: "GitHub", href: "https://github.com/monoes", external: true },
      { label: "Community", href: "https://github.com/monoes/monomind/discussions", external: true },
      { label: "Legal", href: "/legal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-espresso-deep px-8 py-16 text-ivory">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={"external" in link && link.external ? "_blank" : undefined}
                      rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-ivory/60 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gold/15 pt-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Monoes open-source AI agent platform logo"
              width={36}
              height={36}
              className="rounded-full opacity-80 border border-gold/20"
            />
            <span className="text-xs text-gold/60">
              &copy; {new Date().getFullYear()} Monoes. All rights reserved.
            </span>
          </div>
          <p className="text-xs text-gold/40">
            Built on the open-source Monomind engine · Apache-2.0
          </p>
        </div>
      </div>
    </footer>
  );
}
