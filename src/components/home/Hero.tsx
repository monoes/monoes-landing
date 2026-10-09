"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hero, heroDesks } from "@/content/home";

const DESK_COUNT = 72;
const WAKE_RADIUS = 150;
const IDLE_MS = 2500;

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
      const camera = q(".hero-camera");
      const floor = q(".hero-floor");
      const light = q(".hero-light");
      const sun = q(".hero-sun");
      const copy = q(".hero-copy");
      const finale = q(".hero-finale");
        const tag = q(".hero-boundary-tag");
      const counter = q(".hero-count");
      const all = Array.from(floor.children) as HTMLElement[];

      let desks: HTMLElement[] = [];
      let centers: number[][] = [];
      let rank: number[] = [];
      let state: boolean[] = [];
      let woke: boolean[] = [];
      let progress = 0;
      let visible = true;

      const measure = () => {
        desks = all.filter((d) => d.offsetParent !== null);
        centers = desks.map((d) => [d.offsetLeft + d.offsetWidth / 2, d.offsetTop + d.offsetHeight / 2]);
        const ox = floor.offsetWidth / 2;
        const oy = floor.offsetHeight * 1.1;
        const dist = centers.map(([x, y]) => Math.hypot(x - ox, (y - oy) * 1.4));
        const sorted = [...dist].sort((a, b) => a - b);
        rank = dist.map((d) => sorted.indexOf(d) / Math.max(1, desks.length - 1));
        state = desks.map(() => false);
        woke = desks.map(() => false);
        apply();
      };

      const apply = () => {
        let n = 0;
        desks.forEach((d, i) => {
          const on = woke[i] || rank[i] <= progress * 1.02;
          if (on) n++;
          if (on !== state[i]) {
            state[i] = on;
            d.classList.toggle("on", on);
          }
        });
        counter.firstChild!.nodeValue = `${n} / ${desks.length}`;
      };

      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      let lastMove = -IDLE_MS;
      const onMove = (e: PointerEvent) => {
        const r = floor.getBoundingClientRect();
        const s = r.width / floor.offsetWidth;
        tx = (e.clientX - r.left) / s;
        ty = (e.clientY - r.top) / s;
        lastMove = performance.now();
      };
      el.addEventListener("pointermove", onMove);

      const tick = () => {
        if (!visible) return;
        const now = performance.now();
        if (now - lastMove > IDLE_MS) {
          const t = now / 1000;
          tx = floor.offsetWidth * (0.5 + 0.42 * Math.sin(t * 0.45));
          ty = floor.offsetHeight * (0.5 + 0.38 * Math.sin(t * 0.31 + 1));
        }
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        light.style.transform = `translate3d(${x}px,${y}px,0)`;
        let changed = false;
        for (let i = 0; i < desks.length; i++) {
          if (woke[i]) continue;
          const dx = centers[i][0] - x;
          const dy = centers[i][1] - y;
          if (dx * dx + dy * dy < WAKE_RADIUS * WAKE_RADIUS) {
            woke[i] = true;
            changed = true;
          }
        }
        if (changed) apply();
      };

      measure();
      x = tx = floor.offsetWidth * 0.62;
      y = ty = floor.offsetHeight * 0.3;
      gsap.ticker.add(tick);
      window.addEventListener("resize", measure);
      document.fonts.ready.then(measure);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            progress = self.progress;
            apply();
          },
          onToggle: (self) => {
            visible = self.isActive || self.progress === 0;
          },
        },
      });
      tl.to(camera, { scale: 0.88, duration: 1 }, 0)
        .fromTo(sun, { yPercent: 38, scale: 0.7, opacity: 0.55 }, { yPercent: -12, scale: 1.4, opacity: 1, duration: 1 }, 0)
        .to(copy, { yPercent: -14, autoAlpha: 0, ease: "power2.in", duration: 0.32 }, 0.22)
        .to(floor, { opacity: 0.38, duration: 0.3 }, 0.62)
        .fromTo(tag, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.25 }, 0.7)
          .fromTo(finale, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, 0.62);

      return () => {
        gsap.ticker.remove(tick);
        el.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", measure);
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.querySelectorAll(".hero-floor > *").forEach((d) => d.classList.add("on"));
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero-stick">
        <div className="hero-sun" aria-hidden="true" />
        <div className="hero-camera" aria-hidden="true">
          <div className="hero-boundary">
            <span className="hero-boundary-label">{hero.boundary.label}</span>
            <span className="hero-boundary-tag">{hero.boundary.finale}</span>
          </div>
          <div className="hero-floor">
            {Array.from({ length: DESK_COUNT }, (_, i) => (
              <div
                key={i}
                className="desk"
                style={{ "--d": `${(i * 37) % 11}` } as React.CSSProperties}
              >
                {heroDesks[(i * 7) % heroDesks.length]}
              </div>
            ))}
          </div>
          <div className="hero-light" />
        </div>
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 id="hero-title">
              <span className="hl hl-1">{hero.lead}</span>
              <span className="hl hl-2">
                <b>{hero.strong}</b> {hero.connector}
              </span>
              <span className="hl hl-3">
                <b className="accent">{hero.accent}</b>
              </span>
            </h1>
            <p className="hero-sub">{hero.sub}</p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href={hero.primary.href} data-magnetic>
                {hero.primary.label} <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn-blue" href={hero.secondary.href} data-magnetic>
                {hero.secondary.label}
              </a>
            </div>
            <p className="hero-claim">{hero.claim}</p>
          </div>
          <div className="hero-finale">
            <p className="hero-finale-title">
              {hero.finale.lead} <b className="accent">{hero.finale.accent}</b>
            </p>
            <p className="hero-finale-sub">{hero.finale.sub}</p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href={hero.primary.href}>
                {hero.primary.label} <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn-blue" href={hero.secondary.href}>
                {hero.secondary.label}
              </a>
            </div>
          </div>
        </div>
        <p className="hero-meta" aria-hidden="true">
          Desks staffed <b className="hero-count">{`0 / ${DESK_COUNT}`}</b>
          <span className="hero-hint"> · move your pointer, then scroll</span>
        </p>
      </div>
    </section>
  );
}
