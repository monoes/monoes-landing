"use client";
import { motion, useReducedMotion } from "framer-motion";

const QUOTE_WORDS = "The question is no longer whether AI can execute the work. The question is whether one person can decide fast enough to keep up with it.".split(" ");

const expo = [0.16, 1, 0.3, 1] as const;

export function ResearchHero() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20 pb-16 bg-ivory-warm overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-ivory-parchment/60 to-transparent" />

        <div className="relative max-w-5xl mx-auto w-full">
          <motion.p
            className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-10"
            initial={reduce ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: expo }}
          >
            Monoes Research &nbsp;·&nbsp; June 2026 &nbsp;·&nbsp; Whitepaper
          </motion.p>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-[88px] font-semibold text-espresso tracking-tight leading-[0.92] mb-8"
            initial={reduce ? {} : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: expo }}
          >
            The One-Person
            <br />
            <span className="text-gold-dark">Company</span>
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-espresso/45 uppercase tracking-label mb-14"
            initial={reduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: expo }}
          >
            A Framework for Centralized Agentic Operation
          </motion.p>

          {/* Animated quote */}
          <motion.blockquote
            className="text-xl md:text-2xl lg:text-3xl font-light text-espresso/70 leading-relaxed max-w-3xl"
            initial={reduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {QUOTE_WORDS.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={reduce ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.025, ease: expo }}
              >
                {word}
                {i < QUOTE_WORDS.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </motion.blockquote>

          {/* Scroll nudge */}
          <motion.div
            className="mt-14 flex items-center gap-3"
            initial={reduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.2 }}
          >
            <div className="h-px w-12 bg-espresso/15" />
            <span className="text-[10px] uppercase tracking-label text-espresso/30">Scroll to read</span>
          </motion.div>
        </div>
      </section>

    </>
  );
}
