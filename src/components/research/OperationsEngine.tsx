"use client";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

const CAPABILITIES = [
  { req: "70+ workflow nodes, DAG-based execution", cap: "A multi-step process (a data pipeline, a campaign, an outreach sequence) becomes a reusable, versioned workflow instead of a person following a checklist by hand." },
  { req: "Real browser automation (stealth Chrome via CDP)", cap: "Tasks that only exist inside a web UI, a portal or a tool with no API, get automated directly instead of waiting on an integration to be built." },
  { req: "Multi-profile isolation", cap: "Multiple accounts, clients, or business units run in parallel with fully isolated data and sessions, no cross-contamination." },
  { req: "Human-in-Loop controls", cap: "Any step in a workflow can pause for a human decision before continuing. Judgment stays human; repetition doesn't." },
  { req: "AI integrations inline", cap: "A step that needs reasoning rather than plain execution calls a model as one node in the workflow, not a separate manual task." },
  { req: "Manual, cron, and webhook triggers", cap: "Workflows run on a schedule, in response to an event, or on demand. No person needs to remember to start them." },
];

export function OperationsEngine() {
  const reduce = useReducedMotion();

  return (
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
            Case Study B: Business Operations
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold text-ivory tracking-tight mb-5">
            The same pattern,
            <br />outside the codebase.
          </h2>
          <p className="text-ivory/45 max-w-2xl font-light leading-relaxed">
            Case Study A showed the pattern applied to code. Mono Agent applies
            the identical claim to work that has no repository and no pull
            request: define the process once, let a DAG executor run every
            instance of it, review the exceptions. Where Monomind&apos;s
            orchestrator decomposes a specification into code, Mono Agent&apos;s
            executor decomposes a workflow into steps.
          </p>
        </motion.div>

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

        <motion.p
          initial={reduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 pt-8 border-t border-white/10 text-sm text-ivory/40 max-w-2xl leading-relaxed"
        >
          This case study is younger than Case Study A and doesn&apos;t carry
          the same weight of published research yet. The engineering numbers
          in the next section are specific to AI-generated code; treat them
          as evidence for that case study only, not as a stand-in for
          operations automation.
        </motion.p>
      </div>
    </section>
  );
}
