"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCurrentUser } from "@/lib/community/use-current-user";

type Section = { href: string; label: string; match: (path: string) => boolean };

export const COMMUNITY_SECTIONS: Section[] = [
  { href: "/community", label: "Home", match: (p) => p === "/community" },
  {
    href: "/community/orgs",
    label: "Orgs",
    match: (p) => p.startsWith("/community/orgs") || p.startsWith("/community/org-run-files") || p.startsWith("/library/orgs"),
  },
  {
    href: "/community/workflows",
    label: "Workflows",
    match: (p) => p.startsWith("/community/workflows") || p.startsWith("/library/workflows"),
  },
  {
    href: "/community/automations",
    label: "Web automations",
    match: (p) => p.startsWith("/community/automations") || p.startsWith("/library/automations"),
  },
  { href: "/library", label: "Library", match: (p) => p === "/library" || p.startsWith("/library/upload") },
  { href: "/community/features", label: "Feature requests", match: (p) => p.startsWith("/community/features") },
  {
    href: "/community/bugs",
    label: "Bug reports",
    match: (p) => p.startsWith("/community/bugs") || p.startsWith("/community/posts"),
  },
];

/**
 * The community's own section menu, pinned under the site navbar on every
 * community and library page, so any section is one click away from any
 * other (before, only the /community hub linked the sections).
 */
export function CommunityNav({ pathname }: { pathname: string }) {
  const me = useCurrentUser();
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const active = COMMUNITY_SECTIONS.find((s) => s.match(pathname));

  // On narrow screens the list scrolls sideways; keep the current section in view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  const personal = me
    ? [
        ...(me.username ? [{ href: `/community/u/${me.username}`, label: "My profile" }] : []),
        ...(me.role === "admin" ? [{ href: "/community/admin", label: "Admin" }] : []),
      ]
    : [];

  return (
    <nav
      aria-label="Community sections"
      className="sticky top-[69px] z-20 border-b border-ivory-linen bg-ivory-warm/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-8">
        <ul
          ref={listRef}
          className="community-nav-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2"
        >
          {COMMUNITY_SECTIONS.map((s) => {
            const isActive = s === active;
            return (
              <li key={s.href} className="shrink-0">
                <Link
                  href={s.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative block rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark ${
                    isActive ? "font-medium text-ivory" : "text-espresso/75 hover:bg-espresso/5 hover:text-espresso"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="community-nav-active"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-espresso"
                      transition={reduceMotion ? { duration: 0 } : { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.35 }}
                    />
                  )}
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          {personal.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={pathname === p.href ? "page" : undefined}
              className="rounded-full px-3 py-1.5 text-sm text-espresso/75 transition-colors hover:text-espresso aria-[current=page]:font-medium aria-[current=page]:text-espresso"
            >
              {p.label}
            </Link>
          ))}
          <Link
            href={me ? "/library/upload" : "/community/login"}
            className="ml-1 rounded-full bg-gold-dark px-4 py-1.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark"
          >
            {me ? "Share" : "Log in"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
