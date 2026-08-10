"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { capabilities } from "@/lib/workforce";

const expo = [0.16, 1, 0.3, 1] as const;

export function CapabilitiesGrid() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory-parchment px-8 md:px-16 lg:px-24 py-24 md:py-28 border-b border-ivory-linen">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-14 max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso tracking-tight mb-5 text-balance">
            Six departments. One platform underneath.
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed mb-4">
            We don&apos;t build a new tool per department. We configure the same
            engine against each team&apos;s process. This is a starting sample, not
            the ceiling.
          </p>
          <Link
            href="/workforce/capabilities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:text-espresso transition-colors"
          >
            Browse the full catalog (23 departments, 136 workers) →
          </Link>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.department}
              initial={reduce ? {} : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: expo }}
              className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft"
            >
              <h3 className="text-sm font-semibold text-espresso mb-4 leading-snug">
                {cap.department}
              </h3>
              <ul className="space-y-2">
                {cap.workers.map((worker) => (
                  <li
                    key={worker}
                    className="flex gap-2.5 text-xs text-espresso/60 leading-relaxed"
                  >
                    <span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-gold-dark/60" />
                    {worker}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
