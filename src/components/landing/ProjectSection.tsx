"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/projects";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProjectSectionProps {
  project: Project;
}

const monkeyImages: Record<string, string> = {
  "mono-agent": "/images/monkey/coding-laptop.png",
  "monomind": "/images/monkey/meditating-brain.png",
  "mono-clip": "/images/monkey/clipboard-thumbsup.png",
  "monotask": "/images/monkey/task-board.png",
};

export function ProjectSection({ project }: ProjectSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const progressBar = progressBarRef.current;
    const content = contentRef.current;
    if (!section || !progressBar || !content) return;

    const featureItems = content.querySelectorAll(".feature-item");

    // Pin the section
    const pinSt = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=300%",
      pin: true,
      pinSpacing: true,
    });

    // Progress bar fill
    const progressSt = gsap.to(progressBar, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=300%",
        scrub: true,
      },
    });

    // Feature items stagger in
    const featureSt = gsap.fromTo(
      featureItems,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=100%",
          scrub: true,
        },
      }
    );

    return () => {
      pinSt.kill();
      progressSt.kill();
      featureSt.kill();
    };
  }, []);

  const displayFeatures = project.features.slice(0, 3);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen bg-ivory-warm overflow-hidden"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-ivory-linen z-10">
        <div
          ref={progressBarRef}
          className="h-full w-0"
          style={{ backgroundColor: project.accent }}
        />
      </div>

      <div ref={contentRef} className="flex h-full">
        {/* Left side - 60% */}
        <div className="flex flex-col justify-center px-10 md:px-16 lg:px-20 py-20 w-full md:w-[60%] space-y-8">
          {/* Project number */}
          <div className="space-y-1">
            <p
              className="text-xs uppercase tracking-label font-semibold"
              style={{ color: project.accent }}
            >
              {project.number}
            </p>
            <p
              className="text-xs uppercase tracking-label text-espresso/50 font-medium"
            >
              {project.language}
            </p>
          </div>

          {/* Tagline / headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-espresso leading-tight max-w-xl">
            {project.tagline}
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-espresso/65 font-normal max-w-lg leading-relaxed">
            {project.description}
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
            {displayFeatures.map((feature, i) => (
              <div
                key={i}
                className="feature-item bg-ivory rounded-lg p-4 border-l-2 shadow-soft space-y-1"
                style={{ borderColor: project.accent }}
              >
                <span className="text-xl">{feature.icon}</span>
                <p className="text-sm font-semibold text-espresso">{feature.title}</p>
                <p className="text-xs text-espresso/60 leading-snug">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA link */}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-label font-medium transition-opacity hover:opacity-70"
            style={{ color: project.accent }}
          >
            Explore {project.name}
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Right side - 40% */}
        <div className="hidden md:flex items-center justify-center w-[40%] px-10">
          <div
            className="relative w-56 h-56 lg:w-72 lg:h-72 rounded-full flex items-center justify-center border"
            style={{ borderColor: project.accent + "40" }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-10"
              style={{ backgroundColor: project.accent }}
            />
            {/* Monkey persona */}
            <Image
              src={monkeyImages[project.id] || "/images/monkey/hero-full.jpg"}
              alt={`${project.name} mascot`}
              width={200}
              height={200}
              className="rounded-full object-cover object-top w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
