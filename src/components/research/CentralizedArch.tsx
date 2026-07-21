"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

const PIPELINE = [
  { icon: "✍", label: "Human writes spec", sub: "Linear / Jira / GitHub Issues" },
  { icon: "⇄", label: "MCP pulls context", sub: "Ticket + codebase graph" },
  { icon: "◎", label: "Orchestrator reads", sub: "Decomposes into subtasks" },
  { icon: "⚡", label: "Agents execute", sub: "Coder, tester, security" },
  { icon: "✓", label: "Tests pass", sub: "Automated, before human review" },
  { icon: "◈", label: "Reviewer validates", sub: "Against original spec" },
  { icon: "👁", label: "Human reviews diff", sub: "Intent, not syntax" },
];

const MEMORY_TIERS = [
  { badge: "JSON", title: "Pattern Store", detail: "Hook and trajectory learning — routing outcomes, edit patterns — persisted as JSON files. Independent of the SQLite backend below; not yet consolidated into one system.", time: "Continuous", pct: 35 },
  { badge: "SQLite", title: "Default Search Path", detail: "Local SQLite (better-sqlite3, sql.js WASM fallback) with local embeddings. Backs memory store/search, the MCP memory tools, and Second Brain retrieval — no cloud vector DB involved.", time: "Default", pct: 100 },
  { badge: "HNSW", title: "Opt-in Vector Index", detail: "A pure-JS HNSW index exists in the memory package but sits off the default search path — reachable only via memory search --build-hnsw, not used automatically.", time: "Opt-in only", pct: 20 },
];

function ArchSVG() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();

  type PathConfig = {
    d: string;
    delay: number;
    label?: string;
    lx?: number;
    ly?: number;
  };

  const paths: PathConfig[] = [
    { d: "M 185 195 Q 257 200 330 212", delay: 0.3, label: "MCP", lx: 252, ly: 196 },
    { d: "M 570 212 Q 642 188 715 160", delay: 0.4, label: "context", lx: 638, ly: 178 },
    { d: "M 420 255 Q 316 290 212 330", delay: 0.55, label: "orchestrate", lx: 292, ly: 292 },
    { d: "M 480 255 Q 576 290 672 330", delay: 0.55, label: "query", lx: 588, ly: 292 },
    { d: "M 212 400 Q 321 410 430 410", delay: 0.7 },
    { d: "M 672 400 Q 601 410 530 410", delay: 0.7 },
  ];

  return (
    <svg
      ref={ref}
      viewBox="0 0 900 490"
      className="w-full"
      aria-label="Centralized AI orchestration architecture diagram"
      style={{ fontFamily: "var(--font-sans, system-ui)" }}
    >
      {/* Paths */}
      {paths.map((p, i) => (
        <g key={i}>
          <motion.path
            d={p.d}
            fill="none"
            stroke="rgba(200,169,126,0.45)"
            strokeWidth="1.5"
            initial={reduce ? {} : { pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: p.delay, ease: expo }}
          />
          {p.label && (
            <motion.text
              x={p.lx} y={p.ly}
              textAnchor="middle" fill="rgba(200,169,126,0.55)" fontSize="9"
              fontWeight="600" letterSpacing="0.08em"
              initial={reduce ? {} : { opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: p.delay + 0.6 }}
            >
              {p.label.toUpperCase()}
            </motion.text>
          )}
        </g>
      ))}

      {/* Animated particles */}
      {inView && !reduce && (
        <>
          <circle r="3" fill="#C8A97E" opacity="0.9">
            <animateMotion dur="2.8s" repeatCount="indefinite" begin="1.5s" path="M 185 195 Q 257 200 330 212" />
          </circle>
          <circle r="3" fill="#C8A97E" opacity="0.9">
            <animateMotion dur="2.5s" repeatCount="indefinite" begin="2.0s" path="M 420 255 Q 316 290 212 330" />
          </circle>
          <circle r="2.5" fill="#C8A97E" opacity="0.7">
            <animateMotion dur="2.2s" repeatCount="indefinite" begin="2.4s" path="M 212 400 Q 321 410 430 410" />
          </circle>
        </>
      )}

      {/* NODE: AI Orchestrator Core */}
      <g>
        <rect x="330" y="175" width="240" height="80" rx="12"
          fill="rgba(139,105,20,0.16)" stroke="#C8A97E" strokeWidth="1.5" />
        <text x="450" y="207" textAnchor="middle" fill="#C8A97E" fontSize="14" fontWeight="700" letterSpacing="0.05em">AI ORCHESTRATOR</text>
        <text x="450" y="225" textAnchor="middle" fill="rgba(200,169,126,0.5)" fontSize="9.5">Orchestrator</text>
        <text x="450" y="240" textAnchor="middle" fill="rgba(200,169,126,0.4)" fontSize="9">Memory &nbsp;·&nbsp; Hooks &nbsp;·&nbsp; Knowledge Graph &nbsp;·&nbsp; Learning</text>
      </g>

      {/* NODE: PM Tools */}
      <g>
        <rect x="40" y="160" width="145" height="70" rx="8"
          fill="rgba(255,255,240,0.03)" stroke="rgba(255,255,240,0.1)" strokeWidth="1" />
        <text x="112" y="187" textAnchor="middle" fill="rgba(255,255,240,0.65)" fontSize="11" fontWeight="600">PM Tools</text>
        <text x="112" y="205" textAnchor="middle" fill="rgba(255,255,240,0.3)" fontSize="9">Linear · Jira</text>
        <text x="112" y="220" textAnchor="middle" fill="rgba(255,255,240,0.3)" fontSize="9">GitHub Issues · Notion</text>
      </g>

      {/* NODE: Persistent Memory */}
      <g>
        <rect x="715" y="125" width="165" height="70" rx="8"
          fill="rgba(255,255,240,0.03)" stroke="rgba(255,255,240,0.1)" strokeWidth="1" />
        <text x="797" y="152" textAnchor="middle" fill="rgba(255,255,240,0.65)" fontSize="11" fontWeight="600">Persistent Memory</text>
        <text x="797" y="170" textAnchor="middle" fill="rgba(255,255,240,0.3)" fontSize="9">Local SQLite storage</text>
        <text x="797" y="184" textAnchor="middle" fill="rgba(255,255,240,0.3)" fontSize="9">Local embeddings · opt-in HNSW</text>
      </g>

      {/* NODE: Agent Swarm */}
      <g>
        <rect x="120" y="330" width="185" height="70" rx="8"
          fill="rgba(255,255,240,0.03)" stroke="rgba(255,255,240,0.1)" strokeWidth="1" />
        <text x="212" y="357" textAnchor="middle" fill="rgba(255,255,240,0.65)" fontSize="11" fontWeight="600">Agent Swarm</text>
        <text x="212" y="375" textAnchor="middle" fill="rgba(255,255,240,0.3)" fontSize="9">Specialized agent roles</text>
        <text x="212" y="389" textAnchor="middle" fill="rgba(255,255,240,0.25)" fontSize="8.5">Coder · Reviewer · Security · Tester</text>
      </g>

      {/* NODE: Knowledge Graph */}
      <g>
        <rect x="590" y="330" width="165" height="70" rx="8"
          fill="rgba(255,255,240,0.03)" stroke="rgba(255,255,240,0.1)" strokeWidth="1" />
        <text x="672" y="357" textAnchor="middle" fill="rgba(255,255,240,0.65)" fontSize="11" fontWeight="600">Knowledge Graph</text>
        <text x="672" y="375" textAnchor="middle" fill="rgba(255,255,240,0.3)" fontSize="9">Code knowledge graph</text>
        <text x="672" y="389" textAnchor="middle" fill="rgba(255,255,240,0.25)" fontSize="8.5">46 MCP tools · SQLite · impact analysis</text>
      </g>

      {/* NODE: Output */}
      <g>
        <rect x="390" y="410" width="180" height="60" rx="8"
          fill="rgba(200,169,126,0.08)" stroke="rgba(200,169,126,0.3)" strokeWidth="1" />
        <text x="480" y="434" textAnchor="middle" fill="rgba(200,169,126,0.8)" fontSize="11" fontWeight="600">Your Codebase</text>
        <text x="480" y="452" textAnchor="middle" fill="rgba(200,169,126,0.4)" fontSize="9">Tested · Reviewed · Production-ready</text>
      </g>
    </svg>
  );
}

export function CentralizedArch() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* Dark architecture section */}
      <section className="bg-espresso-deep px-8 md:px-16 lg:px-24 py-24 md:py-32 border-b border-espresso/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: expo }}
            className="mb-14"
          >
            <p className="text-[10px] uppercase tracking-label font-semibold text-gold mb-4">
              The One Machine Architecture
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold text-ivory tracking-tight mb-5">
              Centralize the AI,
              <br />not just the code.
            </h2>
            <p className="text-ivory/45 max-w-2xl font-light leading-relaxed">
              In distributed AI development, each developer's assistant operates with a narrow, session-scoped view. The one-machine model routes all generation through a single system with a unified view of the entire repository, its history, its dependency graph, and what every other agent has already built.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? {} : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: expo }}
          >
            <ArchSVG />
          </motion.div>
        </div>
      </section>

      {/* Pipeline section */}
      <section className="bg-ivory-parchment px-8 md:px-16 lg:px-24 py-24 border-b border-ivory-linen">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: expo }}
            className="mb-14"
          >
            <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-4">
              The Specification-Execution Pipeline
            </p>
            <h2 className="text-2xl md:text-4xl font-semibold text-espresso tracking-tight mb-4">
              From ticket to merged code, without manual prompting
            </h2>
            <p className="text-espresso/55 max-w-xl font-light leading-relaxed text-sm">
              Each component exists in deployable form today. The integration challenge is orchestration.
            </p>
          </motion.div>

          {/* Pipeline steps — vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col md:hidden gap-3">
            {PIPELINE.map((step, i) => (
              <motion.div
                key={step.label}
                initial={reduce ? {} : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: expo }}
                className="flex items-center gap-4 py-3 border-b border-ivory-linen last:border-0"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ivory-warm border border-ivory-linen flex items-center justify-center text-lg">
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-espresso">{step.label}</p>
                  <p className="text-[10px] text-espresso/40">{step.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative hidden md:block">
            <motion.div
              className="absolute top-[26px] left-7 right-7 h-px bg-ivory-linen origin-left"
              initial={reduce ? {} : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: expo }}
            />
            <div className="grid grid-cols-7 gap-4">
              {PIPELINE.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={reduce ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: expo }}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className="w-[52px] h-[52px] rounded-xl bg-ivory-warm border border-ivory-linen flex items-center justify-center text-xl relative z-10">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-espresso leading-snug mb-1">{step.label}</p>
                    <p className="text-[10px] text-espresso/40 leading-snug">{step.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Memory tiers */}
          <div className="mt-20">
            <motion.div
              initial={reduce ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: expo }}
              className="mb-10"
            >
              <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-3">
                Persistent Organizational Memory
              </p>
              <h3 className="text-xl md:text-2xl font-semibold text-espresso tracking-tight">
                The AI remembers everything. You configure what it prioritizes.
              </h3>
            </motion.div>

            <div className="space-y-4">
              {MEMORY_TIERS.map((tier, i) => (
                <motion.div
                  key={tier.badge}
                  initial={reduce ? {} : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: expo }}
                  className="flex items-start gap-6 py-5 border-b border-ivory-linen last:border-0"
                >
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-sm font-bold text-gold-dark">{tier.badge}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-sm font-semibold text-espresso">{tier.title}</p>
                      <span className="text-[10px] text-espresso/35 font-mono">{tier.time}</span>
                    </div>
                    {/* Access bar */}
                    <div className="w-full h-1 bg-ivory-linen rounded-full mb-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-gold-dark rounded-full"
                        initial={reduce ? {} : { width: 0 }}
                        whileInView={{ width: `${tier.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: expo }}
                      />
                    </div>
                    <p className="text-xs text-espresso/55 leading-relaxed max-w-xl">{tier.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
