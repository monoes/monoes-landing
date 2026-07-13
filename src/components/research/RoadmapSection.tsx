"use client";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

const PHASES = [
  {
    num: "01",
    weeks: "Weeks 1–4",
    title: "Foundation",
    objective: "Establish centralized architecture. Eliminate isolated, per-developer AI tool usage.",
    actions: [
      "Choose and deploy an AI orchestration layer as a shared, project-wide system",
      "Write the project identity file: stack, conventions, architecture decisions, security posture",
      "Connect project management tools via MCP (Linear, Jira, GitHub Issues)",
      "Define the specification ticket template — the standard format agents can parse unambiguously",
      "Enable security constraints: pre-execution validation, credential injection prevention",
    ],
  },
  {
    num: "02",
    weeks: "Weeks 5–10",
    title: "Workflow Integration",
    objective: "Close the loop between specification and execution.",
    actions: [
      "Index the codebase into a knowledge graph: agents query structure before generating",
      "Accumulate 30+ days of organizational memory through session-end storage hooks",
      "Implement the spec-to-code pipeline: tickets flow to implementation without manual prompting",
      "Define an agent role library: standard configurations for common task categories",
      "Establish automated review: security agent and reviewer agent run before any human sees output",
    ],
  },
  {
    num: "03",
    weeks: "Weeks 11–20",
    title: "Organizational Scale",
    objective: "Reach the one-developer company operating model.",
    actions: [
      "Reduce synchronous code review: human review time below 20% of the total development cycle",
      "Implement cognitive debt mitigation: scheduled deep-read cycles of AI-generated code",
      "Enable parallel agent experiments: copy-on-write branching for architectural decisions",
      "Measure output quality objectively via DORA metrics — not self-reported perception",
      "Calibrate escalation thresholds: tune when agents hand off to humans based on observed failure rates",
    ],
  },
];

const METRICS = [
  { label: "Spec-to-deployment cycle time", target: "<4 hours", desc: "For well-specified features" },
  { label: "Human syntax hours per week", target: "<20%", desc: "Of total engineering time" },
  { label: "AI review pass rate", target: ">70%", desc: "First-attempt, before human correction" },
  { label: "Memory retrieval utilization", target: ">60%", desc: "Agent tasks with relevant org context loaded" },
];

export function RoadmapSection() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* Roadmap */}
      <section className="bg-ivory-warm px-8 md:px-16 lg:px-24 py-24 md:py-32 border-b border-ivory-linen">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: expo }}
            className="mb-16"
          >
            <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-4">Implementation Roadmap</p>
            <h2 className="text-3xl md:text-5xl font-semibold text-espresso tracking-tight mb-5">
              Three phases to
              <br />organizational AI.
            </h2>
            <p className="text-espresso/55 max-w-2xl font-light leading-relaxed">
              This is not a product adoption. It is a methodological transformation. Each phase has a clear objective, concrete actions, and measurable success criteria.
            </p>
          </motion.div>

          {/* Phase cards */}
          <div className="space-y-0">
            {PHASES.map((phase, i) => (
              <motion.div
                key={phase.num}
                initial={reduce ? {} : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: expo }}
                className="py-10 border-b border-ivory-linen last:border-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 md:gap-16">
                  <div>
                    <p className="text-4xl font-semibold text-espresso/10 mb-1 tabular-nums">{phase.num}</p>
                    <p className="text-[10px] uppercase tracking-label text-gold-dark font-semibold mb-1">{phase.weeks}</p>
                    <p className="text-lg font-semibold text-espresso">{phase.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-espresso/65 mb-5 font-medium">{phase.objective}</p>
                    <ul className="space-y-2.5">
                      {phase.actions.map((action, j) => (
                        <motion.li
                          key={j}
                          initial={reduce ? {} : { opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: 0.2 + j * 0.05, ease: expo }}
                          className="flex items-start gap-3 text-xs text-espresso/60 leading-relaxed"
                        >
                          <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-gold-dark/60" />
                          {action}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key metrics */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: expo }}
            className="mt-16"
          >
            <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-8">
              Key metrics: distinguishing the one-developer model from high-productivity-assistant
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <p className="text-2xl font-semibold text-gold-dark mb-1">{m.target}</p>
                  <p className="text-xs font-semibold text-espresso mb-1">{m.label}</p>
                  <p className="text-[10px] text-espresso/40">{m.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-espresso-deep px-8 md:px-16 lg:px-24 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: expo }}
          >
            <p className="text-[10px] uppercase tracking-label font-semibold text-gold mb-6">Conclusion</p>
            <h2 className="text-3xl md:text-5xl font-semibold text-ivory tracking-tight mb-8 leading-tight">
              The transition is irreversible.
              <br />The structure is the work.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-16">
              <p className="text-ivory/50 font-light leading-relaxed">
                The transition to centralized agentic software engineering commoditizes code syntax. By repositioning engineers as spec writers and intent orchestrators, teams achieve unprecedented developmental velocity. But the velocity only compounds when the harness is right — the architecture, the memory, the verification pipeline, the trust calibration.
              </p>
              <p className="text-ivory/50 font-light leading-relaxed">
                The organizations that make this transformation first will not merely be more efficient. They will operate in a different competitive environment: one where the cost of software production has dropped far enough that the constraint is no longer how fast you can build, but how clearly you can think about what to build.
              </p>
            </div>

            <motion.div
              initial={reduce ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: expo }}
              className="pt-10 border-t border-white/10 mb-16"
            >
              <p className="text-2xl md:text-3xl font-light text-ivory/70 leading-relaxed max-w-2xl mb-10">
                That is a different problem. It is a better problem to have.
              </p>

              {/* Neutral tool mention */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 max-w-2xl">
                <p className="text-[10px] uppercase tracking-label font-semibold text-gold mb-4">
                  One implementation of this model
                </p>
                <p className="text-sm text-ivory/55 leading-relaxed mb-5">
                  The architecture described in this paper — persistent organizational memory, codebase-aware retrieval, MCP project management integration, lifecycle hooks, specialized agents, and security harness — is implemented as a ready-made layer for Claude Code in <strong className="text-ivory/80 font-semibold">Monomind</strong>. It is one way to put this model into practice without building the infrastructure from scratch.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="https://github.com/monoes/monomind"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gold-dark text-ivory text-xs font-medium px-5 py-2.5 rounded-lg transition-opacity hover:opacity-80"
                  >
                    View on GitHub →
                  </a>
                  <a
                    href="/projects/monomind"
                    className="text-xs text-ivory/35 hover:text-ivory/60 transition-colors"
                  >
                    Learn more about Monomind
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Citations */}
            <div className="pt-8 border-t border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-label text-ivory/20 mb-4">References</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {[
                  "[1] CACM 2024 — GitHub Copilot Productivity Study (n=35, p=0.0017)",
                  "[2] arXiv 2501.13282 — ZoomInfo Enterprise Deployment (400+ engineers)",
                  "[3] BlueOptima 2024 — Independent Objective Productivity Measurement",
                  "[4] Pieter Levels — Nomad List, Remote OK, Photo AI ($3.5M ARR)",
                  "[7] arXiv 2510.03463 — ALMAS: Meta-RAG for Large-Scale SE (ASE 2025)",
                  "[8] Thoughtworks 2025 — Spec-Driven Development Engineering Practice",
                  "[12] arXiv 2404.04834 — LLM Multi-Agent SE Review (ACM TOSEM, 71 studies)",
                  "[13] arXiv 2511.00872 — LLM-SmartAudit Benchmark, below 90% ceiling",
                  "[16] arXiv 2604.13277 — Automation Bias in AI-Assisted Code Review",
                  "[17] arXiv 2604.03501 — TRACE Framework: Artifact Trust Calibration",
                ].map((ref) => (
                  <p key={ref} className="text-[10px] text-ivory/20 font-mono leading-relaxed">{ref}</p>
                ))}
              </div>
              <p className="text-[10px] text-ivory/15 mt-6">
                Monoes Research · June 2026 · adversarially verified across 34 sources
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
