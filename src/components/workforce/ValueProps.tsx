"use client";
import { motion, useReducedMotion } from "framer-motion";
import { valueProps } from "@/lib/workforce";

const expo = [0.16, 1, 0.3, 1] as const;

export function ValueProps() {
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
            We don&apos;t sell you a model. We sell you the outcome.
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed">
            The pitch isn&apos;t agents or architecture. It&apos;s what changes on
            your P&amp;L once the process runs itself.
          </p>
        </motion.div>

        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {valueProps.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={reduce ? {} : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: expo }}
              className="border-t border-espresso/10 pt-5"
            >
              <h3 className="text-base font-semibold text-espresso mb-2 leading-snug">
                {prop.title}
              </h3>
              <p className="text-sm text-espresso/55 leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
