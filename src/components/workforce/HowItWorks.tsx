"use client";
import { motion, useReducedMotion } from "framer-motion";
import { engagementPhases } from "@/lib/workforce";

const expo = [0.16, 1, 0.3, 1] as const;

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory px-8 md:px-16 lg:px-24 py-24 md:py-28 border-b border-ivory-linen">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-16 max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso tracking-tight mb-5 text-balance">
            Land small. Prove it. Expand worker-by-worker.
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed">
            We don&apos;t ask you to commit to a platform rollout. We start on
            your single most painful process and let the ROI make the case for
            the next one.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            className="absolute left-[19px] top-10 w-px bg-ivory-linen origin-top"
            style={{ bottom: "2rem" }}
            initial={reduce ? {} : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.2, ease: expo }}
          />

          {engagementPhases.map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={reduce ? {} : { opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: expo }}
              className="flex gap-8 py-7 border-b border-ivory-linen last:border-0"
            >
              <span className="flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center text-[11px] font-semibold border border-ivory-linen bg-ivory-warm text-gold-dark z-10 relative">
                {i + 1}
              </span>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-espresso tracking-tight">
                    {phase.phase}
                  </h3>
                  <span className="text-[10px] uppercase tracking-label font-semibold text-gold-dark border border-gold-dark/30 rounded-sm px-2 py-0.5">
                    {phase.timeline}
                  </span>
                </div>
                <p className="text-sm text-espresso/60 leading-relaxed max-w-2xl">
                  {phase.outcome}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: expo }}
          className="mt-14 pt-8 border-t border-ivory-linen flex items-start gap-3"
        >
          <span className="flex-shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold-dark/10 text-gold-dark">
            HUMAN
          </span>
          <p className="text-sm text-espresso/55 leading-relaxed">
            High-risk decisions always route to a person. The worker executes
            the process; a human still owns the exceptions and approvals that
            matter.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
