# Workforce Demo Video — Shot-by-Shot Scenario

~90 seconds, one screen recording, no voiceover needed. Text captions in the terminal aesthetic (espresso/gold, JetBrains Mono). Mirrors the actual pipeline declared in `src/lib/workforce.ts:192-203` so what you show matches what the site claims.

## Setup before recording

- A real `processDefinitionExample` running locally (`monomind org run` on a tiny test org with one AP agent)
- A sample invoice PDF (realistic — vendor name, line items, total, a PO number)
- Your ERP open in a second tab (or a mock — QuickBooks/Sage screenshot works)
- Terminal in monospace, ivory background, espresso text — match the site

---

## SCENE 1 — The trigger (0:00–0:10)

**Camera:** Full-screen terminal, cursor blinking.

**Action:** An email arrives. Caption slides in: *`invoice_received` trigger fires*.

**Text on screen:**

```
→ trigger: invoice_received  (acme-corp-invoice-1047.pdf, $18,420)
```

Hold 3s.

**Beat to land:** the worker starts itself — no human kicked it off.

---

## SCENE 2 — Extract (0:10–0:25)

**Camera:** Terminal + a thumbnail of the invoice PDF on the right.

**Action:** Show the agent reading the PDF. Stream the extraction live:

```
[AP Agent] extract_document…
  vendor:    Acme Corp
  invoice #: 1047
  total:     $18,420.00
  date:      2026-08-10
  PO:        PO-2204 (matched from subject line)
✓ extracted in 2.1s
```

**Caption:** *Step 1 of 6 — extract*

**Beat to land:** the agent read an unstructured document and turned it into clean structured fields.

---

## SCENE 3 — Validate + match (0:25–0:45)

**Camera:** Terminal, scrolling.

**Action:** Show validation against the PO:

```
[AP Agent] validate_vendor…
  ✓ Acme Corp is an approved vendor (V-0117)
[AP Agent] match_po…
  PO-2204 line items: 3 matches, 0 mismatches
  PO total:   $18,420.00
  Invoice:    $18,420.00
  variance:   0.000  ✓ under 0.05 threshold
✓ matched
```

**Caption:** *Steps 2–3 — validate & match*

**Beat to land:** the worker did the boring cross-check work, no human touched it.

---

## SCENE 4 — The decision + the human gate (0:45–0:65)  ← THE KEY SCENE

**Camera:** Terminal, then a notification slide-in.

**Action:** The decision fires, but the policy catches it:

```
[AP Agent] decision  rule: variance < 0.05
  ✓ rule satisfied
[Policy]  ⚠ approval required — invoice > $20,000 threshold? NO
          → wait. hold on. threshold is $20,000, this is $18,420.
          → rule check: invoice under auto-approve threshold?
          → YES — auto-approved under policy v2026.04
```

Then **for the second example** (cut quickly), drop in a higher-value invoice to show the gate actually firing:

```
[Policy]  ⚠ approval required — invoice $47,500 > $20,000
          → routed to: sarah@yourcompany.com
          → status: WAITING
```

A small banner appears: *"Sarah approved · 2m 14s later"* → status flips to `✓ approved`.

**Caption:** *Step 4 — the policy, not the model, decides what's allowed*

**Beat to land:** this is the whole thesis. A reasoning model isn't deciding what's allowed — a separate, versioned, auditable policy layer is. The human only gets pulled in when it actually matters.

**Don't skip this scene — it's what makes you not-RPA and not-chatbot.**

---

## SCENE 5 — ERP action (0:65–0:80)

**Camera:** Terminal + your ERP tab (or mock).

**Action:**

```
[AP Agent] erp_action…
  → POST /accounts-payable/invoices
  ← 201 Created  (invoice ID: INV-99213)
  → GL posting:  Dr Accounts Payable $18,420
                 Cr Inventory Control $18,420
✓ posted
```

Switch to the ERP tab showing the invoice sitting there, posted, matched, approved-by line populated.

**Caption:** *Step 5–6 — post & finish*

**Beat to land:** the worker didn't hand off to a human for the last mile — it actually finished the job in the system of record.

---

## SCENE 6 — The audit trail (0:80–0:90)

**Camera:** Terminal, one clean summary block fades in.

**Action:**

```
─────────────────────────────────────
 INVOICE 1047 · complete
 6 steps · 2.1s extract · 0s wait · 2m 14s HIL (Sarah)
 0 manual touches
 policy v2026.04 · audit-trail id: at_88421
─────────────────────────────────────
```

**End card (3s):** *Monoes Workforce — workers that finish the job. Book a Discovery audit →* (link to `/workforce`)

---

## Editing notes

- **Total length: 85–95 seconds.** Don't go longer.
- **No voiceover** — the terminal output is the dialogue. Captions in `JetBrains Mono`, gold on espresso.
- **One continuous take per scene** — cut on the step transitions, not mid-step. The "live" feeling is the whole asset.
- **Pace the HIL scene slower** — give the policy block 8 seconds, not 4. It's the conversion moment.
- **End on the audit trail**, not on a sales line. The block speaking for itself is more convincing than copy.

## Placement

- **Workforce hero** — replace the "See how it works" button with "Watch a worker process an invoice →" (modal or inline).
- **`/workforce/how-it-works#process-model`** — second clip showing just the HIL gate firing.
