"use client";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

const ENGINES = [
  {
    label: "Engine A",
    name: "Monomind",
    scope: "Code-shaped work",
    desc: "Features, fixes, infrastructure, tests, review. An orchestrator decomposes a specification into subtasks, delegates them to specialized agents with a shared knowledge graph and persistent memory of the codebase, and runs the verification pipeline before a human sees the diff.",
    examples: ["Ship a feature", "Fix a bug", "Refactor a module", "Write and run tests"],
  },
  {
    label: "Engine B",
    name: "Mono Agent",
    scope: "Everything-else-shaped work",
    desc: "Data entry, CRM updates, scheduled reports, browser tasks, outreach sequences. A visual DAG workflow engine with 70+ node types and real browser automation executes multi-step processes on a trigger, a schedule, or on demand, with a human-in-the-loop checkpoint on any step that needs one.",
    examples: ["Sync data between two systems", "Run a weekly report", "Qualify and route leads", "Automate a task in a tool with no API"],
  },
];

export function TwoEnginesSection() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory px-8 md:px-16 lg:px-24 py-24 md:py-32 border-b border-ivory-linen">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-16"
        >
          <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-4">
            The Core Claim
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold text-espresso tracking-tight mb-5">
            One person. Two execution engines.
            <br />
            Unlimited task volume.
          </h2>
          <p className="text-espresso/55 max-w-2xl font-light leading-relaxed">
            {`A person's throughput used to be capped by how much they could personally do. Once execution, not judgment, is the thing being scaled, that cap stops applying. The question for any given task is no longer "can this person do it," it's "is there an engine that turns a spec into execution for this category of work." There are two.`}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {ENGINES.map((engine, i) => (
            <motion.div
              key={engine.name}
              initial={reduce ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: expo }}
              className="rounded-2xl border border-espresso/10 bg-white p-8 shadow-soft"
            >
              <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-3">
                {engine.label}
              </p>
              <h3 className="text-2xl font-semibold text-espresso mb-1">{engine.name}</h3>
              <p className="text-sm font-medium text-espresso/50 mb-5">{engine.scope}</p>
              <p className="text-sm text-espresso/65 leading-relaxed mb-6">{engine.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {engine.examples.map((ex) => (
                  <span
                    key={ex}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-espresso/10 text-espresso/55"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: expo }}
          className="mt-14 pt-10 border-t border-ivory-linen text-xl md:text-2xl font-light text-espresso/70 leading-relaxed max-w-3xl"
        >
          The human&apos;s day compresses to two questions: what should we
          automate next, and did the last automation do the right thing.
          Everything between those two questions is engine work.
        </motion.p>
      </div>
    </section>
  );
}
