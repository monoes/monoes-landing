"use client";
import { motion, useReducedMotion } from "framer-motion";
import { discoveryPackages, discoveryContactEmail } from "@/lib/workforce";

const expo = [0.16, 1, 0.3, 1] as const;

function mailtoHref(subject: string) {
  return `mailto:${discoveryContactEmail}?subject=${encodeURIComponent(subject)}`;
}

export function DiscoveryPackages() {
  const reduce = useReducedMotion();

  return (
    <section
      id="discovery"
      className="relative bg-espresso px-8 md:px-16 lg:px-24 py-24 md:py-28 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-16 max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-ivory tracking-tight mb-5 text-balance">
            Start with a priced audit, not a sales cycle.
          </h2>
          <p className="text-ivory/55 font-light leading-relaxed">
            Discovery is the only thing we price up front. Implementation is
            scoped and quoted after we know what we&apos;re automating.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-ivory/10">
          {discoveryPackages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={reduce ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: expo }}
              className={i === 1 ? "md:pl-8" : ""}
            >
              <span className="text-[10px] uppercase tracking-label font-semibold text-gold">
                {pkg.duration}
              </span>
              <div className="mt-3 mb-2 flex items-baseline gap-3">
                <h3 className="text-xl font-semibold text-ivory">{pkg.name}</h3>
              </div>
              <p className="text-3xl font-semibold text-gold mb-5">{pkg.price}</p>
              <p className="text-sm text-ivory/60 leading-relaxed mb-6 max-w-sm">
                {pkg.description}
              </p>
              <ul className="space-y-2.5 mb-8">
                {pkg.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm text-ivory/70 leading-relaxed"
                  >
                    <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-gold/70" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={mailtoHref(pkg.mailSubject)}
                className="inline-block rounded-full border border-gold/40 px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-espresso"
              >
                Book the {pkg.duration} audit →
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={reduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 pt-8 border-t border-ivory/10 text-xs text-ivory/35 max-w-2xl"
        >
          Pilot and rollout pricing is scoped per engagement after Discovery.
          It depends on which processes, which systems, and how many workers
          you decide to run. Not ready to commit yet?{" "}
          <a href="#book-a-call" className="text-gold underline underline-offset-2 hover:text-ivory">
            Book a 30-minute call instead
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
}
