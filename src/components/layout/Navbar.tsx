"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/community/UserMenu";
import { useCurrentUser } from "@/lib/community/use-current-user";

interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navLinks: NavLink[] = [
  { label: "Projects", href: "/product#projects" },
  {
    label: "Workforce",
    href: "/workforce",
    children: [
      { label: "Overview", href: "/workforce" },
      { label: "How it works", href: "/workforce/how-it-works" },
      { label: "Capabilities", href: "/workforce/capabilities" },
      { label: "Build First for companies", href: "/build-first/companies" },
      { label: "Build First for startups", href: "/build-first/startups" },
      { label: "Build First terms", href: "/build-first/terms" },
    ],
  },
  { label: "Whitepaper", href: "/whitepaper" },
  { label: "Blog", href: "/blog" },
  { label: "Library", href: "/library" },
  { label: "Community", href: "/community" },
];

const getStarted =
  "whitespace-nowrap rounded-full bg-gold px-4 py-2.5 text-sm font-bold md:px-5 text-espresso transition-colors hover:bg-gold-warm";

export function Navbar() {
  const me = useCurrentUser();
  const [open, setOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3.5 z-40 flex justify-center px-4 md:px-8">
      <nav
        aria-label="Primary"
        className="pointer-events-auto relative flex w-full max-w-[1080px] items-center gap-2 rounded-full border border-gold/20 bg-espresso/90 py-2 pl-4 pr-2.5 text-ivory shadow-[0_10px_30px_-18px_#1a1208] backdrop-blur-md"
      >
        <Link href="/" className="mr-auto flex items-center" aria-label="Monoes home">
          <Image
            src="/images/logo-wordmark-light.svg"
            alt="Monoes"
            width={153}
            height={24}
            className="h-5 w-auto sm:h-6"
            priority
          />
        </Link>

        <ul className="hidden items-center md:flex">
          {navLinks.map((link) => (
            <li key={link.href} className="group relative">
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-ivory/75 transition-colors hover:text-gold"
              >
                {link.label}
                {link.children && (
                  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" className="ml-1.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4l3 3 3-3" />
                  </svg>
                )}
              </Link>
              {link.children && (
                <ul className="invisible absolute left-0 top-full z-50 min-w-60 rounded-2xl border border-gold/20 bg-espresso-deep p-2 opacity-0 shadow-[0_10px_30px_-18px_#1a1208] transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {link.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="flex min-h-11 items-center rounded-xl px-3.5 text-sm text-ivory/85 transition-colors hover:text-gold focus-visible:text-gold"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 [&_a]:whitespace-nowrap">
          <UserMenu />
          {me === null && (
            <Link href="/community/login" className={`${getStarted} ml-1`}>
              Get started
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ivory/80 transition-colors hover:text-gold md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>

        {open && (
          <ul id="mobile-menu" className="absolute inset-x-0 top-[calc(100%+8px)] flex flex-col rounded-3xl border border-gold/20 bg-espresso-deep p-2 md:hidden">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-2xl px-4 text-ivory/85 hover:text-gold"
                >
                  {link.label}
                </Link>
                {link.children && (
                  <ul className="mb-1 ml-4 border-l border-gold/20 pl-2">
                    {link.children.slice(1).map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="flex min-h-11 items-center rounded-2xl px-4 text-sm text-ivory/70 hover:text-gold"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
