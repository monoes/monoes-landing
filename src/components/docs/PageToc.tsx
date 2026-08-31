"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Heading = { id: string; text: string };

export function PageToc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLHeadingElement>("#docs-main h2[id]"));
    // Reading the DOM for headings rendered by the page content is the sync
    // point itself — there's no prop/state to derive this from instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(nodes.map((n) => ({ id: n.id, text: n.textContent ?? "" })));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden shrink-0 xl:block xl:w-52">
      <nav className="sticky top-24 border-l border-ivory-linen pl-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso/45">On this page</p>
        <ul className="space-y-1.5 text-[13px]">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block truncate transition-colors ${
                  activeId === h.id ? "font-medium text-gold-dark" : "text-espresso/55 hover:text-espresso"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
