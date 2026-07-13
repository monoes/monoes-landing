"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { TextReveal } from "@/components/ui/TextReveal";

export function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const emblemy = useTransform(scrollYProgress, [0, 1], ["-30px", "30px"]);
  const emblemScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 md:px-16 lg:px-24 overflow-hidden bg-ivory-warm"
    >
      {/* Subtle gold divider line */}
      <div className="absolute top-0 left-24 right-24 h-px bg-gold/20" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        {/* Left: text */}
        <div className="space-y-8">
          <p className="text-xs uppercase tracking-label text-gold-dark font-medium">
            The Philosophy
          </p>

          <TextReveal
            text="Mono: singular focus. Each tool does one thing with obsessive precision."
            tag="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-espresso"
            stagger={0.06}
          />

          <TextReveal
            text="No cloud dependencies. No accounts. Just software that respects you."
            tag="p"
            className="text-lg md:text-xl font-light text-gold-bronze leading-relaxed"
            stagger={0.04}
          />
        </div>

        {/* Right: parallax emblem */}
        <div className="flex items-center justify-center">
          <motion.div
            style={{ y: emblemy, scale: emblemScale }}
            className="relative w-56 h-56 md:w-72 md:h-72"
          >
            <div className="w-full h-full rounded-full gold-gradient opacity-10 absolute inset-0 blur-3xl" />
            <div className="w-full h-full rounded-full overflow-hidden border border-gold/25 shadow-soft-lg">
              <Image
                src="/images/monkey/meditating-brain.png"
                alt="Monoes mascot"
                width={700}
                height={700}
                sizes="(max-width: 768px) 224px, 288px"
                className="w-full h-full object-cover object-top"
                quality={95}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-24 right-24 h-px bg-gold/20" />
    </section>
  );
}
