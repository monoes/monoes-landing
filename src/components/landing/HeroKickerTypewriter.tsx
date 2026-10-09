"use client";

import { useEffect, useRef } from "react";

/**
 * Renders `text` normally (full text in the server HTML, so no-JS/SEO/screen
 * readers always get it immediately). If JS + motion are available, briefly
 * clears and retypes it on mount as a cosmetic flourish only — never the
 * other way around.
 */
export function HeroKickerTypewriter({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    el.textContent = "";

    const tick = (i: number) => {
      if (cancelled) return;
      el.textContent = text.slice(0, i);
      if (i < text.length) timer = setTimeout(() => tick(i + 1), 16);
    };
    timer = setTimeout(() => tick(1), 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      el.textContent = text;
    };
  }, [text]);

  return <span ref={ref}>{text}</span>;
}
