"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

export function PoweredByMonomind() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory-warm px-8 md:px-16 lg:px-24 py-24 md:py-28 border-b border-ivory-linen">
      <motion.div
        initial={reduce ? {} : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: expo }}
        className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-8 md:gap-16"
      >
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-label font-semibold text-gold-dark">
            Under the hood
          </span>
          <h2 className="mt-3 mb-5 text-2xl md:text-3xl font-semibold text-espresso tracking-tight text-balance">
            The same engine that runs Monomind runs your workers.
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-xl">
            Monomind is our open-source AI orchestration engine: persistent
            memory, multi-agent coordination, a codebase knowledge graph. It&apos;s
            free and self-hostable for developers. Workforce is the same engine,
            configured and operated by us against your business processes
            instead of a codebase.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/projects/monomind"
            className="inline-flex items-center gap-2 rounded-full border border-espresso/15 px-6 py-3 text-sm font-semibold text-espresso/70 transition-colors hover:border-espresso/30 hover:text-espresso"
          >
            See the open-source engine →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
