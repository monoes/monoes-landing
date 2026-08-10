"use client";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

export function BookACall() {
  const reduce = useReducedMotion();

  return (
    <section id="book-a-call" className="bg-ivory px-8 md:px-16 lg:px-24 py-24 md:py-28 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-10 max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso tracking-tight mb-5 text-balance">
            Not ready to commit to an audit? Talk to us first.
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed">
            Grab 30 minutes. We&apos;ll tell you honestly whether Workforce fits
            what you&apos;re trying to automate.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: expo }}
          className="rounded-2xl border border-espresso/10 bg-white shadow-soft-lg overflow-hidden"
        >
          <iframe
            src="https://cal.com/morteza/30min"
            title="Book a 30-minute call with Monoes Workforce"
            loading="lazy"
            className="w-full h-[700px] md:h-[800px]"
          />
        </motion.div>
      </div>
    </section>
  );
}
