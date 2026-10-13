# Outreach System on monoagent (v0.1, validated drafts, nothing running)

Seven workflows in `workflows/` (JSON). All are `is_active: false`, start from `trigger.manual` only (no schedule, no webhook), and pass `workflow_validate`. Lead data (personal information) lives outside the repo in `/home/monoes/outreach/` and must never be committed.

## 1. Safety design

1. **Nothing sends without approval.** In every workflow, each path from the trigger to a send node passes through `core.human_in_loop` (checked by script: no path without it). `auto_decide` is not set, so the approval can never be settled by software. Pending items appear in `hil_list`.
2. **Social sends run through monoagent, but only after approval.** The LinkedIn and X send nodes (`linkedin.send_dms`, `x.send_dms`) are enabled in `bf-03`, `bf-04` and `bf-06`, and every path to them passes `core.human_in_loop`. The email send node stays disabled until SMTP credentials and consent handling are set up. Approved messages are also staged in a CSV. Note: LinkedIn and X terms restrict automated use of logged-in sessions; this is an accepted business decision and the account-protection caps in section 5 apply.
3. **STOP is honoured before anything else.** Replies containing stop words (English and German) are added to `suppression.csv` immediately, with no approval step and no reply sent. The classifier's "stop" class does the same.
4. **Suppression is checked twice**: before drafting, and again after human approval (a STOP that arrives while a draft waits for review still blocks it).
5. **Pre-send lint** blocks any draft that is 80 words or longer, lacks exactly one link to our own page or the opt-out sentence, contains "free", "guarantee", "risk-free", "limited time", "100%", "testimonial" or "as seen in", leaves a placeholder, or does not reference the lead's specific hook. The human can edit the draft; it is linted again after approval.
6. **Caps and warm-up are enforced in code** (section 5).
7. **Existing workflows were not touched.** Note that the existing active workflow "Outreach - Send Approved DMs" goes straight from a manual trigger to `linkedin.send_dms` with no approval node of its own, so it sends whatever it is given. Consider deactivating it.

## 2. Workflows

| Id | Does | Sends? |
|---|---|---|
| `bf-01-lead-source` | Reads one public RSS feed per run, extracts company and public event, normalizes to the lead schema | No |
| `bf-02-lead-score` | Scores a leads CSV with the rubric below; drops tier "drop" | No |
| `bf-03-sequence-linkedin` | Guard, draft, lint, human approval, post-approval guard, stage for manual send | Only via disabled node |
| `bf-04-sequence-x` | Same for X DMs | Only via disabled node |
| `bf-05-sequence-email` | Same for email, with consent-basis rules and a legal footer | Only via disabled node |
| `bf-06-reply-triage` | STOP detection, classification, drafted replies, human approval | Only via disabled nodes |
| `bf-07-kpi-rollup` | Funnel counts and rates from an events CSV | No |

Run inputs (manual trigger):
- `bf-01`: `{"feed_url": "..."}` (you choose public feeds; none are assumed).
- `bf-02`: `{"leads_path": ".../leads.csv"}`.
- `bf-03/04/05`: `{"leads_path", "suppression_path", "sent_today", "warmup_week"}`.
- `bf-06`: `{"replies_path", "suppression_path"}` (CSV columns: lead_id, handle, channel, name, reply_text, audience).
- `bf-07`: `{"events_path"}`.

## 3. Lead list schema (CSV, one row per lead)

| Column | Meaning |
|---|---|
| lead_id | stable id, e.g. `src-acme-labs` |
| org, website, country, region | company facts (region: DE, EU, UK, US, other) |
| name, title, handle | person, role, profile URL/username or email. Found by hand from public profiles; `bf-01` never produces handles |
| audience | `companies` or `startups` |
| line | `modernize`, `flow` or `launch` |
| channel | `linkedin`, `x` or `email` |
| stage, employees, funding_date, funds_evidence | fit and ability-to-pay evidence |
| hook, hook_source_url, hook_date | one specific, public, checkable fact about the lead, with its source |
| tags, regulated | technology tags; `true` excludes the lead |
| consent_basis | email only: `requested`, `waitlist`, `existing_relationship`, `non_eu_b2b_reviewed` |
| status | sourced, qualified, replied, stop, declined, converted, bounced |
| step, last_step, last_sent_at | sequence position |
| score, tier, score_reasons | written by `bf-02` |

Sources allowed: public news and funding announcements, company websites, people who applied or asked to be contacted. Not allowed: scraping behind a login, purchased or harvested email lists, fake profiles.

## 4. Scoring rubric (`bf-02`)

Regulated domain: score 0 and excluded. 60+ qualifies for a sequence, 40 to 59 nurture, below 40 dropped.

| Companies | Points | Startups | Points |
|---|---|---|---|
| 50+ employees | 20 | Funded in last 18 months | 30 |
| Decision-maker title | 20 | Stage pre-seed or seed (series A or bootstrapped: 8) | 15 |
| Legacy or modernization signal | 25 | Founder or decision-maker title | 15 |
| Public trigger within 90 days | 15 | Building signal (hiring, MVP, launch) | 20 |
| Evidence of ability to pay | 10 | Public trigger within 90 days | 10 |
| Both: specific public hook with source | 10 | | |

## 5. Rate limits and warm-up (planning values, enforced in the guard)

These are conservative internal caps, not published platform limits. Stop and reduce at the first warning, restriction or spike in complaints.

| Channel | Week 1 | Week 2 | Week 3 | Week 4+ | Other rules |
|---|---|---|---|---|---|
| LinkedIn | 5/day | 10/day | 15/day | 20/day | Send by hand, spread over the day; 1st-degree or accepted connections first; never re-send after a decline |
| X | 5/day | 10/day | 15/day | 20/day | Only people who follow, interacted or allow DMs |
| Email | 10/day | 20/day | 30/day | 40/day | Dedicated sending domain with SPF, DKIM, DMARC and one-click unsubscribe; pause if bounces exceed 2% or any spam complaint |

Sequence timing: first touch; follow-up 1 after 4 days; follow-up 2 after 7 more; breakup after 10 more. A reply or STOP ends the sequence. Maximum four messages per person, ever.

## 6. Message sequences (examples used as style guides; each under 80 words)

The workflow asks the model for a fresh message per lead using the hook; these show the shape. Word counts were checked: 30 to 62 words, one link, no banned phrases.

**LinkedIn** (ends with the opt-out sentence)
- First touch: "Hi {first_name}, I saw {hook}. Monoes modernizes software stacks against a written Acceptance Spec, built in staging, and you pay only if the build meets every requirement (terms apply). Would a sample Spec for a project like yours be useful? https://monoes.me/build-first/companies Reply STOP and I won't message again."
- Follow-up 1: "Hi {first_name}, one concrete example of what I meant: a Spec row reads "every endpoint returns the same response on the new build as on the legacy system, tested with a replayed request set". Pass or fail, no opinions. Happy to draft rows for {org}: https://monoes.me/build-first/companies Reply STOP and I won't message again."
- Follow-up 2: "Hi {first_name}, quick question about {org}: which part of the current system would you least want to touch during a migration? That is usually the first row we write into a Spec. https://monoes.me/build-first/companies Reply STOP and I won't message again."
- Breakup: "Hi {first_name}, I'll stop here so I don't clutter your inbox. If modernizing {org}'s stack comes up later, a sample Spec is at https://monoes.me/build-first/companies. Either way, good luck with {hook_short}. Reply STOP and I won't message again."

**X** (startups page link)
- First touch: "Hi {first_name}, saw {hook}. We build products and migrations against a written Acceptance Spec in staging; you pay only if it meets every requirement (terms apply). Want a sample Spec? https://monoes.me/build-first/startups Reply STOP to opt out."
- Follow-up 1: "{first_name}, an example row: "A user can sign up, verify email and land on the dashboard." Pass or fail, tested by you. I can sketch 5 rows for {org}: https://monoes.me/build-first/startups Reply STOP to opt out."
- Follow-up 2: "{first_name}, one question: what would a working first version of {org} need to do for you to call it done? That sentence becomes the first Spec row. https://monoes.me/build-first/startups Reply STOP to opt out."
- Breakup: "{first_name}, I'll leave it here. If you want a build you can test before paying, the details are at https://monoes.me/build-first/startups. Good luck with {hook_short}. Reply STOP to opt out."

**Email** (body only; the footer is added separately: reason for contact, "Reply STOP to opt out", Nokhodian UG address). Subjects are plain: "Monoes: build-first offer for {org}".
- First touch, follow-up 1, follow-up 2 and breakup follow the same shape as above, signed "Morteza, Monoes".

For startup leads on equity-based deals the message never says "free" or "no cost".

## 7. Reply handling (`bf-06`)

| Class | Action |
|---|---|
| stop (regex or classifier) | Add to suppression immediately; no reply; end sequence |
| interested | Draft reply offering a sample Spec or a 60 to 90 minute Spec call; human approval |
| objection | Draft from the approved fact sheet only (staging, NDA, fixed price, checklist, Build Fee, exclusions, vetted contributors); if not covered, offer a call; human approval |
| not now | Short acknowledgement, ask when to check back, set `follow_up_after_days = 60`; human approval |
| other | Written to a CSV for manual handling; no draft |

Reply drafts are asked for at most 85 words and linted at 100 words, with at most two links (our page and the terms). A draft that fails the lint goes to `needs-rewrite/` and never reaches approval.

## 8. Compliance

- **Lawful basis (GDPR):** B2B outreach relies on legitimate interest only where a lawyer confirms it; every message states why the person is contacted and how to opt out; opt-out is honoured at once and recorded in the suppression list; data minimised to public professional facts; deletion on request.
- **Germany/EU email:** unsolicited email advertising generally needs prior consent, including B2B. The email workflow therefore only processes leads whose `consent_basis` is `requested`, `waitlist` or `existing_relationship`, and for DE, EU, UK and EEA leads rejects `non_eu_b2b_reviewed`. `non_eu_b2b_reviewed` is for leads outside those regions after a CAN-SPAM-style review.
- **CAN-SPAM:** truthful sender and subject, a postal address in the footer and a working opt-out. The `bf-05` footer carries the postal address of Nokhodian UG, c/o PANTOhealth GmbH, Bismarckstraße 10-12, 10625 Berlin. The lint does not check the footer.
- **Platforms:** the default path is manual sending of approved text. Automated social sending is disabled.
- **No deception:** messages identify Monoes and Morteza, use real hooks with a source, make no claims about clients or results, and are labelled as outreach.
- **Processors:** the drafting step sends lead facts to the configured model runtime (`agent.ask`, runtime `claude`). Add it to the privacy notice and processor records.

## 9. Tracking

Events are rows `lead_id, event, event_at, channel, line, step, tier`. Workflows write per-run CSVs (`sourced/`, `scored/`, `approved/`, `needs-rewrite/`, `needs-human-review/`, `sent/`); concatenate them with the replies and funnel events from the application table into `events.csv` and run `bf-07`.

| KPI in strategy.md | Computed from |
|---|---|
| Reply rate, positive reply rate | replies and interested/objection events divided by first touches sent |
| Opt-out/stop rate | stop events divided by first touches sent |
| Visit to application | landing analytics plus `applied` events |
| Qualified to Spec signed | `spec_call`, `spec_signed` events |
| Pass rate, pass to convert | `build_delivered`, `build_passed`, `converted` events |
| Cost of free builds per signed deal | effort days (manual) divided by `converted` |

## 10. Verified and not verified

Installed in monoagent (profile "personal"), all inactive: the seven workflows. Two inactive test copies with sends disabled also exist (`bf-03-dryrun-nosend`, `bf-06-dryrun-nosend`); delete them with `monoagentcli workflow delete <id>`.

Verified by script and by running in monoagent (2026-10-13), using fake leads only:
- All seven pass `workflow_validate` (MCP and CLI) and `workflow run --dry-run` plans.
- Every send node is reachable only through `core.human_in_loop`; no `auto_decide`; manual triggers only.
- `bf-02` scored a normal lead 100 and excluded a regulated lead. `bf-07` produced correct funnel counts.
- `bf-03` (no-send copy) on a fake LinkedIn lead: the regulated lead was filtered, one draft (69 to 71 words, one link, opt-out, hook referenced) reached a pending `hil_list` item and waited. Rejecting it ended the run with nothing staged or sent. Approving it staged exactly one row in `approved/` and sent nothing.
- `bf-06` (no-send copy): a STOP reply was added to the suppression list immediately and got no reply. An objection reply was classified correctly; a 112-word draft was caught by the lint and sent to `needs-rewrite/`; after the prompt was tightened, a 74-word draft reached approval.
- The first dry run found and fixed a real bug: `core.set` assignments must be stored as a real array, not a JSON string.
- About 30 Node unit assertions on the guard, lint, scoring, triage and rollup code.

Known gap (rule set 2026-10-13): every person or company we approach must first be recorded in monoagent's People, and every message in Communications, before it reaches human approval. The sequence workflows (`bf-03` to `bf-05`) do not do this yet: they write CSV files and rely on a manual `people import`. To be adapted once the monoagent update is in; until then, import leads into People by hand before running a sequence.

Not verified:
- Any real send (never exercised, by design). The `linkedin.send_dms` and `x.send_dms` nodes have not been run, so their behaviour with a real account, pacing and failure modes are unknown.
- `bf-01` (needs a feed URL you choose), `bf-04` (X) and `bf-05` (email) were validated and plan-checked but not executed.
- The post-approval suppression re-check by running workflow (covered only by unit tests).
- Whether the drafting runtime (`claude` via `agent.ask`) is available on every machine that runs these.

## 11. Decisions needed

1. Which public feeds to use for sourcing, and who the first real leads are.
2. Deactivate "Outreach - Send Approved DMs"?
3. Lawyer sign-off on legitimate interest and the email rules.
