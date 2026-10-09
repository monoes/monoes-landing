"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface VNode {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  sub?: string;
  fill: string;
  stroke: string;
  textColor: string;
}

const NODES: VNode[] = [
  { id: "trigger", x: 46, y: 70, r: 22, label: "Trigger", fill: "rgba(200,169,126,0.12)", stroke: "#C8A97E", textColor: "#FAF7F0" },
  { id: "browser", x: 46, y: 220, r: 22, label: "Browser · Data", fill: "rgba(200,169,126,0.12)", stroke: "#C8A97E", textColor: "#FAF7F0" },
  { id: "bridge", x: 236, y: 145, r: 30, label: "AI step", sub: "runs on Monomind", fill: "#8B6914", stroke: "#C8A97E", textColor: "#FFFFF0" },
  { id: "lead", x: 420, y: 60, r: 24, label: "Lead", fill: "#8B6914", stroke: "#C8A97E", textColor: "#FFFFF0" },
  { id: "architect", x: 420, y: 150, r: 20, label: "Architect", fill: "rgba(139,105,20,0.18)", stroke: "#8B6914", textColor: "#FAF7F0" },
  { id: "coder", x: 420, y: 235, r: 20, label: "Coder", fill: "rgba(139,105,20,0.18)", stroke: "#8B6914", textColor: "#FAF7F0" },
];

const EDGES: [string, string][] = [
  ["trigger", "bridge"],
  ["browser", "bridge"],
  ["bridge", "lead"],
  ["bridge", "architect"],
  ["bridge", "coder"],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function HeroDagVisual() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const svg = svgRef.current;
    const section = sectionRef.current;
    if (!svg || !section) return;

    const paths = svg.querySelectorAll<SVGPathElement>("[data-edge]");
    const nodes = svg.querySelectorAll<SVGGElement>("[data-node]");

    if (reduceMotion) {
      gsap.set(paths, { strokeDashoffset: 0, opacity: 1 });
      gsap.set(nodes, { opacity: 1, scale: 1 });
      return;
    }

    paths.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.9 });
    });
    gsap.set(nodes, { opacity: 0, scale: 0.85, transformOrigin: "center" });

    let st: ReturnType<typeof import("gsap").gsap.timeline> | null = null;

    (async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "top 20%",
          scrub: true,
        },
      });
      tl.to(nodes[0], { opacity: 1, scale: 1, duration: 0.15 })
        .to(nodes[1], { opacity: 1, scale: 1, duration: 0.15 }, "<")
        .to(paths[0], { strokeDashoffset: 0, duration: 0.2 })
        .to(paths[1], { strokeDashoffset: 0, duration: 0.2 }, "<")
        .to(nodes[2], { opacity: 1, scale: 1, duration: 0.15 })
        .to([paths[2], paths[3], paths[4]], { strokeDashoffset: 0, duration: 0.25, stagger: 0.05 })
        .to([nodes[3], nodes[4], nodes[5]], { opacity: 1, scale: 1, duration: 0.2, stagger: 0.05 }, "<");

      st = tl;
    })();

    return () => {
      st?.scrollTrigger?.kill();
      st?.kill();
    };
  }, []);

  return (
    <div ref={sectionRef} className="w-full">
      <svg
        ref={svgRef}
        viewBox="0 0 480 300"
        className="w-full h-auto"
        role="img"
        aria-label="Diagram: a Mono Agent workflow trigger and browser step feed an AI step that runs on the Monomind runner, which fans out to a Monomind org of a lead, an architect, and a coder."
      >
        {EDGES.map(([from, to], i) => {
          const a = nodeById(from);
          const b = nodeById(to);
          return (
            <path
              key={i}
              data-edge
              d={`M ${a.x + a.r} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x - b.r} ${b.y}`}
              fill="none"
              stroke="#C8A97E"
              strokeWidth={1.5}
            />
          );
        })}
        {NODES.map((n) => (
          <g key={n.id} data-node>
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.fill} stroke={n.stroke} strokeWidth={1.5} />
            <text
              x={n.x}
              y={n.sub ? n.y - 3 : n.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontWeight={600}
              fill={n.textColor}
            >
              {n.label}
            </text>
            {n.sub && (
              <text x={n.x} y={n.y + 11} textAnchor="middle" dominantBaseline="middle" fontSize={7.5} fill="rgba(255,255,240,0.65)">
                {n.sub}
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/30">
        Mono Agent → AI step on the Monomind runner → Monomind org
      </p>
    </div>
  );
}
