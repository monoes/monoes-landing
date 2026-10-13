# Offer Mechanics: "Build First, Pay Only If It Meets Spec" (v0.2)

Status: v0.2, founder decisions applied. Remaining `[bracketed]` values are set per deal at pre-agreement or by the founder. Not legal advice; section 9 lists what a lawyer must review. Every page, post and message in this campaign may only claim what is stated here.

## 0. The offer and the wording rule

Monoes builds against a written, signed **Acceptance Spec**, with no upfront payment. The build stays in a Monoes-controlled staging environment. The client reviews it against the Spec checklist. If every row passes, the terms agreed *before* the build take effect and the parties work together officially. If any row fails after the fix window, the client owes nothing.

**Wording rule.**
- Never write "perfect" or "guarantee".
- Never write "free" or "no cost" as a standalone claim. Equity deals are not free: equity is consideration.
- Approved claim: **"No upfront payment. You pay only if the build meets every requirement in your Acceptance Spec."**
- Equity variant: **"No upfront payment. We are paid only if the build meets your Acceptance Spec."**

**Where the terms live.** Full conditions live on a dedicated Terms page (path set in Phase 3). The visual pages stay clean, with two safeguards:
1. Every "pay only if" claim sits next to a visible "Terms apply" link.
2. One plain sentence is kept on each page: *"If every requirement passes, you proceed on the terms agreed beforehand, or a Build Fee applies. Details in the terms."* The pass-then-decline consequence is a material condition of the headline claim; hiding it entirely would risk misleading-advertising findings in Germany/EU (section 9). Everything else (percentages, LOC bands, equity mechanics) goes on the Terms page only.

## 1. Three build lines (named separately from Monoes Workforce)

Workforce remains the managed enterprise automation service: it starts with a Discovery audit ($3,000 for 1 day, $12,000 for 5 days) that is paid after delivery, plus SME Discovery (process discovery and charting only, from $15,000, also paid after delivery); implementation is scoped from that research. The build-first lines below are separate products with their own names. Working names, to confirm: **Modernize**, **Flow**, **Launch**, under the umbrella "Build First".

| Line | What it is | Main audience | Charged after acceptance |
|---|---|---|---|
| **Modernize** (priority 1) | Move a legacy stack to a modern one for performance, efficiency, maintainability. | Companies | Fixed price, banded by measured lines of code (see 6) |
| **Flow** (priority 2) | Build process automations from scratch, enterprise or startup. | Companies and startups | SaaS subscription per live automation |
| **Launch** (priority 3) | Research to complete product for an idea owner. | Startups, enterprise, qualified individuals | Cash, cash plus equity, or equity only |

Risk to manage: "Flow" and Workforce overlap for enterprise automation. Rule: a company that wants AI digital workers deployed on its existing ERP/CRM goes to Workforce; Flow is the no-upfront-payment, build-from-scratch line with a per-automation subscription. Pages must make that boundary clear and never show both prices side by side.

## 2. Qualification gate

Final say belongs to Monoes. Declines are polite and give a reason category.

| Applicant | Hard criteria | Evidence (no sensitive documents) |
|---|---|---|
| Company (all lines) | Enough funds to pay the agreed price if the build succeeds; a named decision maker with signing authority; a named technical or ops contact | Company registry lookup, domain email, decision maker's public profile; budget range disclosed in the form |
| Startup, cash or mixed | Incorporated entity; a named founder who can sign; ability to pay the cash part | Public funding announcement, investor reference, or revenue screenshot |
| Startup, equity-only (Launch) | Incorporated entity (or commitment to incorporate before conversion); clean, documented cap table; authority and ability to issue equity; Monoes diligence on the idea and founders, since Monoes carries the risk | Registry extract, cap table (valuations may be redacted), founder call |
| Individual | Passes if cash ability is shown, or equity deal after incorporation | Same as above |

Screening questions (they double as the form's boundary-validation spec):
1. Company/project name, website, country of registration.
2. Your role; authority to sign up to [amount]; if none, name and role of the signer.
3. Which line: Modernize, Flow or Launch.
4. Funding stage and latest raise (startups) or headcount/revenue band (companies).
5. Budget or deal structure you could agree if the build meets your Spec: cash range, cash plus equity, or equity-only.
6. What do you want built, in 3 to 6 sentences, and what outcome means success? (Modernize: current stack, approximate lines of code, repo hosting. Flow: process, systems, volume. Launch: idea stage, users, market.)
7. Any regulated or safety-critical domain? Any personal data involved?
8. External systems required and whether you have API/sandbox access.
9. Can a decision maker commit [2 hours/week] and answer within [2 business days] throughout?
10. Consent to be contacted about this application (withdrawable) with a privacy notice link.

Auto-decline: regulated or safety-critical product, no named signer, no evidence of ability to pay (cash lines), out-of-scope request, or an equity-only startup that fails diligence.

## 3. Acceptance Spec process

1. **Spec call** (60 to 90 minutes, recorded with consent). Monoes drafts; the client edits.
2. **Format.** Every row has: ID, requirement, test steps, expected result, test data, pass/fail. Binary and testable only. Vague words ("fast", "intuitive", "modern") are converted to a measurable threshold or removed.
3. **Line-specific testable cores.**
   - *Modernize:* behaviour parity (the client's existing test suite plus agreed characterization tests with golden outputs), performance thresholds measured by a named tool, build and lint pass, dependency and security-scan thresholds, documentation rows.
   - *Flow:* each automation scenario with inputs, expected outputs, error and human-approval paths, run on client-supplied sample data.
   - *Launch:* user stories mapped to scripted acceptance flows, plus a research deliverable list (what is in the research pack).
4. **Freeze.** Spec v1.0 is signed by the named decision maker. The build clock starts when the Spec is signed and kickoff dependencies have arrived.
5. **Change Requests.** Written, answered within 2 business days: absorbed (equal effort inside the cap), deferred to the paid phase, or declined. Changes never extend the free build past the scope cap.
6. **Dependencies.** A missed client dependency pauses the clock. After [10 business days] of pause the slot lapses with no cost to either side.

## 4. Scope boundaries (per build slot)

Ceilings are set per deal in the Spec. Starting proposals:
- *Modernize:* one application or service, up to [N] measured lines of code (counted with a named tool, excluding vendored, generated and blank lines), one target stack, no change to business behaviour.
- *Flow:* up to [N] automations, up to [2] integrations with documented APIs.
- *Launch:* one product surface, up to [3] user roles, up to [2] integrations.
- All lines: staging only; fixed build window [N weeks]; effort-day cap [N].

Out of scope: regulated or safety-critical systems, hardware, native mobile (unless agreed in a Launch Spec), production data migration, ongoing hosting or support, legal or compliance certification, content and brand creation, anything needing production credentials before conversion.

**Delivery model.** Work is done by Monoes and vetted freelancers under NDA and IP-assignment agreements, with Monoes reviewing all output. Pages must not claim "in-house" delivery. Client data and code flow to freelancers only under written confidentiality and, where personal data is involved, a processor agreement; the Terms page lists this.

## 5. Evaluation window

- Window: [7] business days from staging delivery.
- **Who judges:** the client, through its own internal sign-off. The client decides internally how it reviews; Monoes does not name or require any reviewer.
- **How:** the checklist. A row passes when its test steps produce its expected result. Failing a row requires naming the row ID and the reproduction steps. Preferences and new ideas go to the paid-phase backlog.
- **Fix window:** one cycle of [5] business days, then re-test of failed rows plus regression rows.
- **Silence:** no answer by the end of the window plus a [3]-day reminder closes it as "not accepted"; staging is removed; nothing is owed.
- **Residual risk (accepted):** because the client is the sole judge, a client can fail a row in bad faith. Mitigations: reproducible test steps in the Spec, a recorded review session, the qualification gate, and the Build Fee clause, which applies only when *all* rows pass.

## 6. IP and access

- Monoes holds the built product in its own staging; no source export, no deploy keys, no production access or data.
- *Modernize:* the client's original code remains the client's. Monoes receives a limited evaluation licence to work on it and deletes it, and the derived output, within [14] days of non-acceptance. Derived code is licensed or assigned only after conversion.
- *Flow:* Monoes keeps the platform and automation IP; the client owns its data and configuration. After acceptance the automation runs as a subscription service.
- *Launch:* IP is assigned to the client on conversion and payment (or equity issuance), per the Conversion Agreement.
- Mutual NDA from the first Spec call. No scraping, copying, reverse engineering or sharing staging with third parties.

## 7. Conversion terms (set at pre-agreement; details on the Terms page only)

Everything is written into the Evaluation Agreement before work begins. Nothing is priced publicly.

| Line | Model |
|---|---|
| Modernize | Fixed price from a banded lines-of-code rate card applied to the measured count; LOC is a sizing proxy, so the final price is capped by the Build Price in the Spec, which removes any incentive to inflate code. |
| Flow | Monthly fee per live automation (SaaS), plus optional one-time setup if agreed. Subscription starts at go-live. |
| Launch | Fixed cash price, cash plus equity, or equity-only (equity percentage, vesting and milestones agreed beforehand). |

- **Pass trigger:** all rows pass. The client then signs the Conversion Agreement within [10] business days.
- **Pass-then-decline (chosen):** a pre-agreed **Build Fee** of [30-50% of the Build Price or equivalent] applies, and the client gets a non-exclusive licence for what the fee covers. For equity-only deals the equivalent is set at pre-agreement; lawyer review needed.
- **Failed Spec:** nothing owed.
- Payment schedule for cash: [40%] on signing, [60%] at production handover within [10] business days; [14]-day warranty on Spec rows.

## 8. Capacity and the waitlist

Capacity is an operational throttle, not a marketing device. With a freelancer network, the real limiter is review quality and Spec-writing time, so the number of slots is set by that, and the page only shows the number that is actually true.
- Slots per month: [N], set by the founder from QA capacity.
- The waitlist is a real queue in the database. "Next slot opens" appears only if computed from that queue.
- No countdown timers, no invented "only N left", no resets for urgency.

## 9. Legal flags (needs a lawyer before launch)

Entity: Nokhodian UG (haftungsbeschränkt), Germany. German law is likely central.
1. **Contracts:** Evaluation Agreement, mutual NDA, Spec annex, Conversion Agreement, Change Requests, freelancer NDAs and IP assignments, subprocessors.
2. **Equity for services:** securities and company law (share issuance, SAFE or convertible, vesting, valuation, tax treatment for both sides, German GmbH notarisation where relevant); whether equity-only is an investment that needs its own diligence documents.
3. **Advertising (UWG, EU Unfair Commercial Practices Directive, FTC "free" guidance for US visitors):** "no upfront payment", "pay only if", scarcity claims, and what must appear next to the claim (section 0). Never "free" for equity deals.
4. **Consumers:** an individual applicant may be a consumer (Verbraucher) with withdrawal and unfair-terms rights; confirm B2B-only terms or the consumer position.
5. **Data protection (GDPR):** applications, outreach, client code and data given to freelancers, processor agreements, retention and deletion at non-acceptance.
6. **Outreach law:** unsolicited email advertising in Germany needs prior consent (UWG section 7), including B2B; this changes the email channel strategy (see strategy doc). LinkedIn and X automation limits are contractual (ToS) risks.
7. **IP:** derived works from client code, open-source licences in the output, AI-generated code ownership, IP on non-acceptance.
8. **Liability, warranty and Build Fee** enforceability under German standard-terms rules (AGB law), which is strict on penalty-like fees and liability caps.

## 10. Weaknesses and status

| # | Weakness | Status |
|---|---|---|
| 1 | "Perfect" is subjective | Fixed: binary Spec rows |
| 2 | Unknown unit economics | Open: run a pilot of [3] builds before scaling; measure conversion; publish nothing |
| 3 | Take-the-build-and-walk | Fixed: Build Fee, staging-only |
| 4 | Scope creep | Fixed: frozen Spec, caps |
| 5 | Client as sole judge can fail rows in bad faith | Accepted by founder; mitigated (section 5) |
| 6 | Adverse selection | Fixed: gate and budget disclosure |
| 7 | Freelancer quality and confidentiality | Open: needs a QA step by Monoes and freelancer contracts |
| 8 | Equity-only deals carry large risk with long delay | Open: diligence gate; consider a cap on equity-only slots per quarter |
| 9 | LOC pricing can be gamed or look arbitrary | Mitigated: bands plus a Spec price cap |
| 10 | Overlap with Workforce | Open: naming and page separation (section 1) |
| 11 | Hidden material terms | Fixed: one-line disclosure plus Terms link |

## 11. Still needed from you

1. Final names for the three lines (and confirm "Flow" does not clash with Mono Agent branding).
2. Slots per month and whether equity-only deals get their own cap.
3. Build Fee percentage, and the equity-only equivalent.
4. First-pilot plan: which 3 real clients or leads to try first.
