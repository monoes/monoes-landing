"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV } from "@/lib/docs/nav";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {DOCS_NAV.map((section) => (
        <div key={section.label}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso/45">{section.label}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-dark ${
                      active ? "bg-gold/12 font-medium text-gold-dark" : "text-espresso/70 hover:bg-ivory-parchment hover:text-espresso"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-ivory-linen px-4 py-3 md:hidden">
        <span className="font-mono text-xs uppercase tracking-wide text-espresso/55">Menu</span>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md border border-espresso/20 px-3 py-1 text-xs font-medium text-espresso transition-colors duration-150 ease-out hover:border-espresso/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-dark"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "Close" : "Browse docs"}
        </button>
      </div>
      <div
        className={`grid border-b border-ivory-linen bg-ivory transition-[grid-template-rows] duration-200 ease-out md:hidden ${
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-b-0"
        }`}
      >
        <div className="overflow-hidden px-4">
          <div className="py-4">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      </div>
      <aside className="hidden shrink-0 md:block md:w-64">
        <div className="sticky top-8 px-2">
          <NavLinks />
        </div>
      </aside>
    </>
  );
}
