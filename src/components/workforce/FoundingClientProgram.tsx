"use client";
import { motion, useReducedMotion } from "framer-motion";
import { foundingClientProgram, discoveryContactEmail } from "@/lib/workforce";

const expo = [0.16, 1, 0.3, 1] as const;

export function FoundingClientProgram() {
  const reduce = useReducedMotion();
  const mailBody =
    "I'm interested in a founding client slot.\n\n- Company name:\n- The process I'd automate first:\n- Preferred Discovery package (1-Day $3,000 / 5-Day $12,000):\n";
  const mailHref = `mailto:${discoveryContactEmail}?subject=${encodeURIComponent(foundingClientProgram.mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  return (
    <section className="bg-ivory-parchment px-8 md:px-16 lg:px-24 py-24 md:py-28 border-b border-ivory-linen">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-4 max-w-2xl"
        >
          <span className="text-[10px] uppercase tracking-label font-semibold text-gold-dark">
            Honest, not proven yet
          </span>
          <h2 className="mt-3 mb-5 text-3xl md:text-4xl font-semibold text-espresso tracking-tight text-balance">
            We&apos;re taking on {foundingClientProgram.slotsTotal} founding clients.
          </h2>
          <p className="text-espresso/55 font-light leading-relaxed">
            We don&apos;t have case studies to show you yet, because we
            haven&apos;t built them. Instead of pretending otherwise, here&apos;s
            the trade we&apos;re offering the first {foundingClientProgram.slotsTotal}{" "}
            companies who work with us.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3 mt-10">
          {foundingClientProgram.terms.map((term, i) => (
            <motion.div
              key={term.label}
              initial={reduce ? {} : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: expo }}
              className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft"
            >
              <h3 className="text-sm font-semibold text-espresso mb-2 leading-snug">
                {term.label}
              </h3>
              <p className="text-xs text-espresso/60 leading-relaxed">{term.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href={mailHref}
            className="inline-block rounded-full bg-gold-dark px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-espresso"
          >
            Ask about a founding slot →
          </a>
          <p className="text-xs text-espresso/40">
            {`Once ${foundingClientProgram.slotsTotal} are filled, this offer is gone. No fixed countdown, we're just being straight about the terms.`}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
