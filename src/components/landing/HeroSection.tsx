"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  speed: number;
  phase: number;
}

const PARTICLE_COUNT = 200;

function buildCircleTargets(
  cx: number,
  cy: number,
  radius: number,
  count: number
): { tx: number; ty: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return {
      tx: cx + Math.cos(angle) * radius,
      ty: cy + Math.sin(angle) * radius,
    };
  });
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    const particles: Particle[] = [];

    function resize() {
      if (!canvas || !section) return;
      const dpr = window.devicePixelRatio || 1;
      const w = section.clientWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx!.scale(dpr, dpr);
      initParticles(w, h);
    }

    function initParticles(w: number, h: number) {
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.18;
      const targets = buildCircleTargets(cx, cy, radius, PARTICLE_COUNT);

      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          targetX: targets[i].tx,
          targetY: targets[i].ty,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.0008 + 0.0004,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const t = Date.now();
      const progress = progressRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        const drift = (1 - progress) * 1.5;
        const driftX = Math.sin(t * p.speed + p.phase) * drift;
        const driftY = Math.cos(t * p.speed + p.phase + 1) * drift;

        const rx = p.x + driftX;
        const ry = p.y + driftY;
        const displayX = rx + (p.targetX - rx) * progress;
        const displayY = ry + (p.targetY - ry) * progress;

        // Bounce scatter particles off edges
        if (!progress || progress < 0.01) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        const alpha = 0.3 + progress * 0.7;
        ctx.beginPath();
        ctx.arc(displayX, displayY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 99, 36, ${alpha * 0.55})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(draw);

    // GSAP ScrollTrigger for progress
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "40% bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    // Scroll trigger for subtle scroll-away parallax
    const scrollSt = gsap.to(
      [titleRef.current, subtitleRef.current],
      {
        opacity: 0.2,
        y: -30,
        ease: "power1.in",
        scrollTrigger: {
          trigger: section,
          start: "20% top",
          end: "50% top",
          scrub: true,
        },
      }
    );

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      st.kill();
      scrollSt.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[200vh] bg-espresso text-ivory pt-16"
    >
      {/* Sticky inner container */}
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />

        {/* Content overlay */}
        <div
          className="relative flex flex-col items-center justify-center h-full text-center px-6"
          style={{ zIndex: 2 }}
        >
          {/* Brand wordmark above headline */}
          <p className="mb-6 text-xs uppercase tracking-label text-gold font-semibold">
            monoes
          </p>
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-ivory max-w-4xl leading-none"
          >
            Tools that think{" "}
            <span className="text-gold">with you</span>
          </h1>
          <p
            ref={subtitleRef}
            className="mt-8 text-lg md:text-xl text-ivory/70 tracking-wide max-w-md font-light leading-relaxed"
          >
            Four open-source instruments. One philosophy.
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ zIndex: 2 }}
        >
          <p className="text-xs uppercase tracking-label text-gold/70">
            Scroll to discover
          </p>
          <div
            className="w-px h-8 bg-gold/50 animate-bounce"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
      </div>
    </section>
  );
}
