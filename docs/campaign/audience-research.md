# Audience Research: Build First, Pay Only If It Meets Spec

Status: DRAFT. **These are hypotheses from domain knowledge and the existing site, not primary research.** No interviews, surveys or market data were collected, and none of it may appear on a page as a statistic. Validate each persona with 5 to 8 conversations before scaling spend. Answers below are bound to `offer-mechanics.md`; if that changes, these change.

Facts already on the site that help: Monoes is open source (Monomind Apache 2.0, Mono Agent MIT), publishes verifiable repositories, has a human-in-the-loop approval pattern, and states no client case studies exist yet. That absence is our honest starting point.

---

## A. Business page: established companies

Lead lines: **Modernize** (stack modernization, priority 1), then **Flow** (automation) and **Launch** (product development). Modernize's natural Spec is behaviour parity plus measurable performance and maintainability thresholds, which is the strongest "objective pass" story we have. Additional objection for this line: *"You will have our source code."* Answer: yes, under an NDA and an evaluation licence; it is deleted within [14] days of non-acceptance; no production access or data is ever needed.

**Persona: "Dana, Head of Operations / Product / IT at a mid-sized company"**
- Owns a process or internal tool that is slow or manual; has budget authority up to a bounded amount, or a direct line to the person who does.
- Has been burned by vendors who overpromise, run late, or hand over something nobody can verify.
- Needs: procurement-friendly paperwork, a named contract, security answers, a timeline she can defend to her boss, and a way to say "we tested it against our own list".
- Triggers: a stalled internal project, a quote that looked too large, an automation idea with no engineering capacity.
- Fears: security exposure, vendor lock-in, being the person who approved a failed project.

**Value proposition (draft):** See the working build, tested against your own written requirements, before you pay for anything. If it does not meet every requirement in the Acceptance Spec, you owe nothing.

**Top 5 objections and answers**
1. *"What is the catch? Nobody builds for free."* Answer: The build is free to you only until you accept. We pay because we expect to win the paid engagement when the build meets your Spec. The conditions are public: qualification, a scope ceiling, a signed Spec, a staging-only build, and the Pass-or-Fee clause [if adopted].
2. *"Who decides whether it passes? Will you just say it is fine?"* Answer: A checklist you co-write and sign before work starts. Each row has exact test steps and an expected result. You run them in your own review, on your own terms; a row fails only when its test steps do not produce the expected result.
3. *"What about our data and security?"* Answer: No production access or production data at any point before you sign. The build uses synthetic or sample data in a staging environment we control, under a mutual NDA, with access logs. Security answers: [placeholder: link to security page / questionnaire once ready].
4. *"What does it cost if it passes, and are we locked in?"* Answer: The Build Price is fixed in writing before work begins, with the payment schedule [40/60 placeholder]. After handover you get [source and IP per the Conversion Agreement]; support is optional and quoted separately.
5. *"Can you actually build this?"* Answer: Only inside the stated scope ceiling, and we say no early if it is outside. You can verify our engineering in public: [Monomind and Mono Agent repositories]. Reference clients: [placeholder: none yet; do not claim].

**Proof strategy:** no client logos or testimonials exist. Use (a) the public open-source repositories as inspectable evidence, (b) a redacted **sample Acceptance Spec** published on the page so buyers can see the rigour, (c) the full terms published openly, (d) a visible "what we will not build" list, (e) later, case studies from the first accepted builds with written client permission. Placeholders must be visibly marked in the UI until real proof exists.

**Primary CTA:** "Apply for a build slot." Secondary: "Download the sample Acceptance Spec."
**Tone:** credible, low-risk, precise. Procurement vocabulary, short sentences, no hype.

---

## B. Startups and individuals page

Lead lines: **Launch** (research to complete product; cash, cash plus equity, or equity-only) and **Flow** for startup process automation. Equity deals never use the words "free" or "no cost".

**Persona: "Sam, technical or non-technical founder of a funded pre-seed/seed startup" (plus qualified solo builder)**
- Has money for roughly [N] months, a deadline (demo, investor update, launch), and no time to evaluate agencies.
- Has been burned by agencies (slow, scope games, handed-over code nobody owns) or by freelancers who vanished.
- Needs speed, working software they can click through, and not wasting runway on a miss.
- Solo builder variant: strong product sense, limited budget, but demonstrable ability to pay.

**Value proposition (draft):** Skip the "trust us" phase. We build your product against a spec you sign, you test it, and you pay only if it passes. Your runway is not at risk during the build.

**Top 5 objections and answers**
1. *"Free work usually means you will own my idea."* Answer: A mutual NDA covers your idea. We keep IP of the staging build until you sign, then the Conversion Agreement transfers or licenses it as written. Your own brand, data and materials stay yours.
2. *"What if you take forever?"* Answer: The build window is fixed ([4] weeks) once the Spec is signed and your dependencies arrive. Missed dependency dates pause the clock, which is stated up front.
3. *"What if I love it but cannot afford it?"* Answer: You disclose your budget range at application and we agree on the Build Price before work starts. If it passes and you decline, [Pass-or-Fee clause B: a Build Fee of X% applies]. It is better to know this now than after the build.
4. *"Is it a toy MVP I cannot extend?"* Answer: Scope is bounded (one product surface, [3] roles, [2] integrations) and delivery is to your Spec. Production handover includes the source and [14]-day warranty on Spec rows. Extra features are a paid next phase.
5. *"Why would you do this?"* Answer: To prove ourselves without asking for trust. We limit slots to [2] per month because our capacity is real, and the waitlist is a real queue.

**Proof strategy:** same constraints. Founder-to-founder tone: show the Monoes founder, the open-source repositories (verifiable), a sample Spec, and the **real** slot status from the database. After the first accepted builds, add named, permissioned case studies. Until then show a clearly marked placeholder: "First case study: [pending first accepted build]".

**Primary CTA:** "Apply for a build slot." Secondary: "Join the waitlist" (when slots are full).
**Tone:** direct, founder-to-founder, plain words, no agency talk.

---

## Messaging pillars (shared)

1. **You see it before you pay.** (Staging build, Spec-driven.)
2. **Objective, not opinion.** (Binary checklist, test steps.)
3. **Honest limits.** (Scope ceiling, qualification gate, real slots.)
4. **No lock-in surprise.** (Fixed price agreed up front.)

## Assumptions

- Monoes can deliver a bounded product to Spec in about [4] weeks per slot, using its own agent tooling. Not verified.
- Buyers will accept a staging-only review. Needs testing in interviews.
- Both audiences distrust "free" claims; conditions shown next to the claim help rather than hurt. Needs A/B testing.

## Validation plan (organic, budget-free)

5 to 8 conversations per audience through existing community, LinkedIn and Indie Hackers contacts, using these questions: what did the last software project cost and how did it fail; what would make you accept a staging-only review; what price range is realistic; what stops you applying.
