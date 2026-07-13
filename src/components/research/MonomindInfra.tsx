"use client";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

const CAPABILITIES = [
  { req: "Persistent organizational memory", cap: "Context survives across sessions. Architectural decisions, rejected approaches, and team conventions accumulate automatically." },
  { req: "Codebase-aware retrieval", cap: "Agents query the dependency graph before generating. No agent works blind on a codebase it has never indexed." },
  { req: "Multi-agent coordination", cap: "An orchestrator decomposes specs and delegates to specialized agents. Parallel execution with structured handoffs." },
  { req: "Project management integration", cap: "Tickets flow directly to the agent pipeline. No human translates requirements from one tool to another." },
  { req: "Lifecycle hook system", cap: "Every session event — start, prompt submission, task completion, file edit — can trigger context injection or constraint enforcement." },
  { req: "Background intelligence workers", cap: "Security audit, performance analysis, pattern detection run continuously without blocking the main workflow." },
  { req: "Organizational learning", cap: "Patterns extracted from completed work are stored and retrieved. The system improves with use rather than resetting each session." },
  { req: "Specialized agent types", cap: "Domain experts for engineering, security, architecture, DevOps, and product rather than one general-purpose model for all tasks." },
  { req: "Security harness", cap: "Destructive command prevention, least-privilege enforcement, and credential injection blocking at the orchestration layer." },
];

const DAY_STEPS = [
  { time: "Morning", actor: "Human", what: "Reviews the project board, writes three new specification tickets, marks two existing tickets as 'ready for AI'." },
  { time: "Automated", actor: "Orchestrator", what: "Reads the ready tickets via MCP. Pulls codebase context via knowledge graph. Decomposes each into subtasks. Spawns specialized agents." },
  { time: "Automated", actor: "Agent pipeline", what: "Executes implementation. Runs tests. Runs security scan. Posts implementation summary and PR link back to the original ticket." },
  { time: "Review", actor: "Human", what: "Reads implementation summaries and diffs. Approves or annotates for revision. Reviews intent compliance, not code style." },
  { time: "Automated", actor: "Orchestrator", what: "Merges approved changes. Closes tickets. Updates organizational memory with patterns learned from this work." },
  { time: "Evening", actor: "Human", what: "Writes the next day's specification tickets. The cycle repeats." },
];

export function MonomindInfra() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* Capabilities section */}
      <section className="bg-espresso px-8 md:px-16 lg:px-24 py-24 md:py-32 border-b border-gold-dark/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: expo }}
            className="mb-14"
          >
            <p className="text-[10px] uppercase tracking-label font-semibold text-gold mb-4">
              What the Infrastructure Must Provide
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold text-ivory tracking-tight mb-5">
              The missing layer
              <br />between intelligence and reliability.
            </h2>
            <p className="text-ivory/45 max-w-2xl font-light leading-relaxed">
              The gap in current AI coding assistants is not generation capability. LLMs can write good code. The gap is organizational continuity: the system of memory, coordination, lifecycle management, and integration that turns a capable but stateless AI into a reliable engineering system. Any orchestration layer that enables the one-developer model must provide these capabilities.
            </p>
          </motion.div>

          {/* Capabilities table */}
          <div className="space-y-0">
            {CAPABILITIES.map((row, i) => (
              <motion.div
                key={row.req}
                initial={reduce ? {} : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: expo }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-white/[0.06] last:border-0"
              >
                <p className="text-xs text-ivory/45 leading-relaxed font-medium">{row.req}</p>
                <p className="text-xs text-ivory/75 leading-relaxed">{row.cap}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* A day in the life */}
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
              One Developer in Practice
            </p>
            <h2 className="text-2xl md:text-4xl font-semibold text-espresso tracking-tight mb-4">
              A day in the life
            </h2>
            <p className="text-espresso/55 max-w-xl font-light leading-relaxed text-sm">
              The human's workday is specification writing, architectural review, and product judgment. Code generation, testing, security scanning, and integration are handled by the agent pipeline.
            </p>
          </motion.div>

          <div className="space-y-0">
            {DAY_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={reduce ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: expo }}
                className="grid grid-cols-[80px_100px_1fr] gap-6 py-6 border-b border-ivory-linen last:border-0 items-start"
              >
                <span className="text-[10px] uppercase tracking-label font-semibold text-espresso/35 pt-0.5">
                  {step.time}
                </span>
                <span className={`text-xs font-semibold pt-0.5 ${
                  step.actor === "Human" ? "text-gold-dark" : "text-espresso/50"
                }`}>
                  {step.actor}
                </span>
                <p className="text-sm text-espresso/65 leading-relaxed">{step.what}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
