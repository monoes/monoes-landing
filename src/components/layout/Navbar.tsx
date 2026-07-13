"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Community", href: "https://github.com/monoes/monomind/discussions", external: true },
  { label: "Projects", href: "/product#projects" },
  { label: "Whitepaper", href: "/whitepaper" },
  { label: "GitHub", href: "https://github.com/monoes", external: true },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 30);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-8 py-4 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(255,255,240,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(200,169,126,0.12)"
            : "1px solid transparent",
        }}
      >
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/monkey/welcoming-arms.png"
            alt="Monoes"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover object-top shadow-soft"
          />
          <span className="text-sm font-semibold uppercase tracking-widest text-espresso">
            Monoes
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="group relative text-sm text-gold-bronze transition-colors hover:text-gold"
            >
              {link.label}
              {link.external && (
                <span className="ml-1 text-xs opacity-50">↗</span>
              )}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
          <Link
            href="https://github.com/monoes/monomind"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-dark transition-all hover:bg-gold-dark hover:text-white"
          >
            Get started →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="text-gold-bronze md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
      </motion.nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-14 z-30 border-b border-ivory-linen bg-ivory/95 backdrop-blur-lg md:hidden">
          <div className="flex flex-col gap-4 px-8 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gold-bronze"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
