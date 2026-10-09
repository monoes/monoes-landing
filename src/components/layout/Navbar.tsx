"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/community/UserMenu";
import { useCurrentUser } from "@/lib/community/use-current-user";

const navLinks = [
  { label: "Projects", href: "/product#projects" },
  { label: "Workforce", href: "/workforce" },
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
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-ivory/75 transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
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
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
