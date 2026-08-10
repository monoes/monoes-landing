"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

export function WorkforceHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-28 pb-16 bg-ivory-warm overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-ivory-parchment/60 to-transparent" />

      <div className="relative max-w-5xl mx-auto w-full">
        <motion.p
          className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-10"
          initial={reduce ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: expo }}
        >
          Monoes Workforce
        </motion.p>

        <motion.h1
          className="text-5xl md:text-6xl lg:text-[76px] font-semibold text-espresso tracking-tight leading-[0.96] mb-8 text-balance"
          initial={reduce ? {} : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: expo }}
        >
          Digital workers that
          <br />
          <span className="text-gold-dark">finish the job.</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-espresso/60 font-light leading-relaxed max-w-2xl mb-4"
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: expo }}
        >
          Not a chatbot. Not RPA. A worker that reads the invoice, checks it, gets
          approval, and posts it into the system: on the ERP, CRM, and email you
          already run.
        </motion.p>

        <motion.p
          className="text-sm text-espresso/40 max-w-2xl mb-12"
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: expo }}
        >
          24/7 execution, with a human in the loop for anything high-risk.
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: expo }}
        >
          <a
            href="#discovery"
            className="rounded-full bg-gold-dark px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-espresso"
          >
            Book a discovery audit →
          </a>
          <Link
            href="/workforce/how-it-works"
            className="rounded-full border border-espresso/15 px-6 py-3 text-sm font-semibold text-espresso/70 transition-colors hover:border-espresso/30 hover:text-espresso"
          >
            See how it works
          </Link>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center gap-3"
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="h-px w-12 bg-espresso/15" />
          <span className="text-[10px] uppercase tracking-label text-espresso/30">
            Powered by the Monomind engine
          </span>
        </motion.div>
      </div>
    </section>
  );
}
