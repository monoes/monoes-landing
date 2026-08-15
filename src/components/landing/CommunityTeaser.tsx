"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export function CommunityTeaser() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative py-40 md:py-56 px-6 overflow-hidden bg-espresso-deep border-t border-gold/15"
    >
      {/* Subtle background glow */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold opacity-[0.08] blur-3xl" />
      </motion.div>

      {/* Top divider */}
      <div className="absolute top-0 left-24 right-24 h-px bg-gold/20" />

      <div className="relative max-w-3xl mx-auto text-center space-y-8">
        {/* Label */}
        <p className="text-xs uppercase tracking-label text-gold font-semibold">
          Join the Troop
        </p>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-ivory">
          Built in the open.{" "}
          <br className="hidden md:block" />
          <span className="text-gold">Shaped by the community.</span>
        </h2>

        {/* Sub-copy */}
        <p className="text-lg md:text-xl font-light text-ivory/70 max-w-xl mx-auto leading-relaxed">
          Every tool is open-source, every decision is in public. Join us and
          help shape what&apos;s next.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="https://github.com/monoes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-espresso text-sm uppercase tracking-label font-semibold rounded-lg transition-all hover:bg-gold-warm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Link>

          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold/40 text-gold text-sm uppercase tracking-label font-semibold rounded-lg transition-all hover:bg-gold/10"
          >
            Community →
          </Link>
        </div>
      </div>
    </section>
  );
}
