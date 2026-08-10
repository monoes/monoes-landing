"use client";
import { motion, useReducedMotion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

const RISKS = [
  {
    id: "security",
    heading: "Security",
    stat: "29–45%",
    statLabel: "of AI-generated code contains vulnerabilities",
    body: "Not a model quality problem. A structural problem: agents generate code without knowing your SOC 2 requirements, your banned libraries, or your last security audit. OWASP Agentic AI Top 10 (2025) documents privilege escalation and cascading hallucination as the top risks.",
    mitigations: [
      "Least-privilege credentials per task, revoked immediately on completion",
      "Sandboxed execution before any production access",
      "Security agent in every pipeline, not just on flagged changes",
      "Machine-readable security constraints injected into every agent context",
    ],
  },
  {
    id: "debt",
    heading: "Cognitive Debt",
    stat: "42 pts",
    statLabel: "drop in error detection when spec and code diverge",
    body: "Automation bias: humans reviewing AI outputs apply lower scrutiny than they would to human-authored code. Over time, the developer's mental model becomes a model of the specification, not the implementation. They believe they understand the system; they understand the intent.",
    mitigations: [
      "Mandatory architectural review ownership, even when AI generates implementation",
      "Scheduled 'deep read' cycles: reading the codebase to understand, not to review",
      "Specification drift detection before human approval, not after",
      "Agent-to-agent review before human review catches inter-agent hallucinations",
    ],
  },
  {
    id: "trust",
    heading: "Trust Calibration",
    stat: "42%",
    statLabel: "drop in error detection when spec and code have silently diverged",
    body: "The subtlest risk: AI models trust the most plausible artifact, which may not be the correct one. Code drifts from its documentation. The AI reads the documentation as ground truth and confidently generates more drift. Caught late, this is expensive. Caught never, this is a silent system failure.",
    mitigations: [
      "TRACE-style specification-to-implementation audits before automated downstream changes",
      "Separate reviewer agent with independent context from the generating agent",
      "Regular blind reviews: predict behavior from spec before reading implementation",
      "DORA metrics tracked objectively, never from self-report",
    ],
  },
];

export function RiskFramework() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory-warm px-8 md:px-16 lg:px-24 py-24 md:py-32 border-b border-ivory-linen">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: expo }}
          className="mb-16"
        >
          <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-4">Risk Framework: Case Study A (Engineering)</p>
          <h2 className="text-3xl md:text-5xl font-semibold text-espresso tracking-tight mb-5">
            The gains are real.
            <br />So are the failure modes.
          </h2>
          <p className="text-espresso/55 max-w-2xl font-light leading-relaxed">
            Three categories, each manageable. None of them are reasons to avoid the model. They are reasons to build the harness carefully. Process discipline fails under deadline pressure. Architectural mitigations do not.
          </p>
        </motion.div>

        <div className="space-y-12">
          {RISKS.map((risk, i) => (
            <motion.div
              key={risk.id}
              initial={reduce ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: expo }}
              className="pt-10 border-t border-ivory-linen first:border-0 first:pt-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
                {/* Left: label + stat */}
                <div>
                  <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-3">
                    Risk {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold text-espresso mb-5">
                    {risk.heading}
                  </h3>
                  <div className="inline-block py-3 px-4 bg-espresso/[0.04] rounded-lg">
                    <p className="text-2xl font-semibold text-espresso mb-0.5">{risk.stat}</p>
                    <p className="text-[10px] text-espresso/50 leading-snug max-w-[140px]">{risk.statLabel}</p>
                  </div>
                </div>

                {/* Right: body + mitigations */}
                <div>
                  <p className="text-sm text-espresso/65 leading-relaxed mb-6">{risk.body}</p>
                  <p className="text-[10px] uppercase tracking-label font-semibold text-gold-dark mb-3">
                    Architectural Mitigations
                  </p>
                  <ul className="space-y-2">
                    {risk.mitigations.map((m, j) => (
                      <motion.li
                        key={j}
                        initial={reduce ? {} : { opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 + j * 0.06, ease: expo }}
                        className="flex items-start gap-3 text-xs text-espresso/60 leading-relaxed"
                      >
                        <span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-gold-dark" />
                        {m}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
