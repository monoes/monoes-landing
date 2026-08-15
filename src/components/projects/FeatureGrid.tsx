"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/projects";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FeatureGrid({ project }: { project: Project }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll<HTMLElement>(".feature-card");
    // Set initial state first so cards are invisible before the trigger fires
    gsap.set(cards, { opacity: 0, y: 28 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      stagger: 0.07,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: { trigger: grid, start: "top 82%", once: true },
    });
  }, []);

  return (
    <section className="bg-espresso px-6 sm:px-8 py-24 border-t border-gold/15">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="mb-3 text-xs uppercase tracking-label font-semibold"
              style={{ color: project.accent }}
            >
              Key Features
            </p>
            <h2 className="text-3xl font-semibold text-ivory md:text-4xl leading-tight">
              Everything you need.
              <br className="hidden md:block" /> Nothing you don&apos;t.
            </h2>
          </div>
          <p className="font-mono text-sm text-gold/40">
            {project.features.length} capabilities
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {project.features.map((feat, i) => (
            <div
              key={i}
              className="feature-card group relative rounded-2xl border border-gold/20 bg-espresso-deep/90 p-7 shadow-soft transition-[border-color,box-shadow,transform] duration-200 hover:border-gold/40 hover:-translate-y-0.5 hover:shadow-soft-lg"
              style={{ opacity: 0 }}
            >
              {/* Index */}
              <span className="absolute top-5 right-6 font-mono text-xs text-gold/40">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-2xl border border-gold/20 bg-gold/10"
              >
                {feat.icon}
              </div>

              {/* Text */}
              <h3 className="mb-2 text-base font-semibold text-ivory leading-snug">
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed text-ivory/65">
                {feat.description}
              </p>

              {/* Accent bar on hover */}
              <div
                className="mt-6 h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-14"
                style={{ backgroundColor: project.accent }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
