"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { trace } from "@/content/home";

export function Trace() {
  const root = useRef<HTMLElement>(null);
  const apply = useRef<(p: number) => void>(() => {});
  const last = useRef(0);
  const [activeId, setActiveId] = useState(trace.defaultId);
  const active = trace.cases.find((c) => c.id === activeId) ?? trace.cases[0];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const track = el.querySelector<HTMLElement>(".trace-track")!;
    const steps = Array.from(track.querySelectorAll<HTMLElement>(".step"));
    const lastIndex = steps.length - 1;
    const setProgress = (p: number) => {
      last.current = p;
      track.style.setProperty("--p", String(p));
      steps.forEach((s, i) => s.classList.toggle("active", p >= i / lastIndex - 0.001));
    };
    apply.current = setProgress;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      setProgress(0);
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => setProgress(self.progress),
      });
      return () => st.kill();
    });

    mm.add("(prefers-reduced-motion: reduce)", () => setProgress(1));

    return () => mm.revert();
  }, []);

  useEffect(() => {
    apply.current(last.current);
  }, [activeId]);

  return (
    <section ref={root} className="trace" aria-labelledby="trace-title">
      <div className="trace-stick">
        <div className="trace-inner wrap">
          <header className="trace-head">
            <p className="kicker">{trace.kicker}</p>
            <div className="trace-tabs" role="tablist" aria-label="Example processes">
              {trace.cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  id={`trace-tab-${c.id}`}
                  aria-selected={c.id === activeId}
                  aria-controls="trace-panel"
                  onClick={() => setActiveId(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div id="trace-panel" role="tabpanel" aria-labelledby={`trace-tab-${activeId}`}>
              <h2 id="trace-title" key={activeId} className="trace-swap">
                <span>{active.title[0]}</span> <b>{active.title[1]}</b>
              </h2>
              <p className="trace-note">{active.note}</p>
            </div>
          </header>
          <div className="trace-frame">
            <span className="trace-frame-label">{trace.boundary}</span>
            <ol className="trace-track">
              <li className="trace-rail" aria-hidden="true">
                <i className="trace-fill" />
                <b className="trace-chip">{active.chip}</b>
              </li>
              {active.steps.map((s, i) => (
                <li key={i} className={`step${s.gate ? " gate" : ""}`}>
                  <span className="node" aria-hidden="true">
                    {s.gate ? "✋" : i + 1}
                  </span>
                  <div key={`${activeId}-${i}`} className="step-text trace-swap">
                    <h3>{s.name}</h3>
                    <p>{s.body}</p>
                    {s.gate && <span className="gate-tag">A person decides</span>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
