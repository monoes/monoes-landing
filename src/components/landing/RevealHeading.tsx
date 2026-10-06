"use client";

import { useEffect, useRef, Children, isValidElement, type ReactNode } from "react";
import { gsap } from "gsap";

type Segment =
  | { kind: "words"; text: string }
  | { kind: "node"; node: ReactNode }
  | { kind: "break" };

function toSegments(children: ReactNode): Segment[] {
  const segments: Segment[] = [];
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      segments.push({ kind: "words", text: String(child) });
    } else if (isValidElement(child) && child.type === "br") {
      segments.push({ kind: "break" });
    } else if (isValidElement(child)) {
      segments.push({ kind: "node", node: child });
    }
  });
  return segments;
}

/**
 * Shared scroll-reveal heading: each word (or inline element, e.g. <em>) masks
 * and slides up into place once, the first time it crosses ~80% viewport.
 * Reduced-motion renders the final state immediately; screen readers always
 * see the full text (it's real DOM text, never canvas/SVG).
 */
export function RevealHeading({
  as: Tag = "h2",
  children,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-reveal-word]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }

    gsap.set(words, { yPercent: 110, opacity: 0 });
    let tween: gsap.core.Tween | undefined;

    (async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      tween = gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.035,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    })();

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [children]);

  const segments = toSegments(children);

  return (
    <Tag ref={ref} className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "break") return <br key={i} />;
        if (seg.kind === "node") {
          return (
            <span key={i} className="inline-block overflow-hidden align-top">
              <span data-reveal-word className="inline-block">
                {seg.node}
              </span>
            </span>
          );
        }
        return seg.text.split(/(\s+)/).map((piece, j) => {
          if (piece === "") return null;
          if (/^\s+$/.test(piece)) return piece;
          return (
            <span key={`${i}-${j}`} className="inline-block overflow-hidden align-top">
              <span data-reveal-word className="inline-block">
                {piece}
              </span>
            </span>
          );
        });
      })}
    </Tag>
  );
}
