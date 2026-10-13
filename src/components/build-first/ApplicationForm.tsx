"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AUDIENCE_LINES,
  BUDGET_OPTIONS,
  DEAL_OPTIONS,
  LINE_LABELS,
  PROFILE_OPTIONS,
  type Audience,
  type FieldErrors,
} from "@/lib/build-first";
import { DISCLOSURE, TERMS_PATH } from "@/lib/build-first-content";

type Phase = "idle" | "sending" | "received" | "waitlisted";

const inputClass =
  "w-full rounded-lg border border-espresso/30 bg-white px-3 py-2.5 text-espresso placeholder:text-espresso/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark aria-[invalid=true]:border-red-700";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-espresso">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mb-1.5 text-sm text-espresso/70">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function ApplicationForm({ audience }: { audience: Audience }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [canSign, setCanSign] = useState("yes");
  const [regulated, setRegulated] = useState("no");
  const summaryRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const text = (name: string) => ({
    id: name,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": describedBy(name, undefined, errors[name]),
    className: inputClass,
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const get = (key: string) => String(fd.get(key) ?? "");
    const payload = {
      audience,
      line: get("line"),
      fullName: get("fullName"),
      email: get("email"),
      role: get("role"),
      organization: get("organization"),
      website: get("website"),
      country: get("country"),
      canSign: get("canSign"),
      signerContact: get("signerContact"),
      profile: get("profile"),
      dealStructure: get("dealStructure"),
      budgetRange: get("budgetRange"),
      description: get("description"),
      regulated: get("regulated"),
      regulatedDetail: get("regulatedDetail"),
      systems: get("systems"),
      commitment: fd.get("commitment") === "on",
      consent: fd.get("consent") === "on",
      companyFax: get("companyFax"),
    };

    setPhase("sending");
    setFormError("");
    setErrors({});
    try {
      const res = await fetch("/api/build-first/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { status?: string; error?: string; fieldErrors?: FieldErrors };
      if (res.ok) {
        setPhase(json.status === "waitlisted" ? "waitlisted" : "received");
        form.reset();
        requestAnimationFrame(() => noteRef.current?.focus());
        return;
      }
      setPhase("idle");
      setErrors(json.fieldErrors ?? {});
      setFormError(json.error ?? "Something went wrong. Please try again.");
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setPhase("idle");
      setFormError("We could not reach the server. Please try again.");
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  if (phase === "received" || phase === "waitlisted") {
    return (
      <div ref={noteRef} tabIndex={-1} role="status" className="rounded-2xl border border-espresso/20 bg-white p-8 focus-visible:outline-2 focus-visible:outline-gold-dark">
        <h3 className="mb-3 text-2xl font-semibold text-espresso">
          {phase === "waitlisted" ? "You're on the waitlist" : "Application received"}
        </h3>
        <p className="text-espresso/80">
          {phase === "waitlisted"
            ? "All build slots are in use right now. We have your application in the queue and will write to you when a slot opens."
            : "We review every application ourselves and reply within two business days. Nothing is charged by applying."}
        </p>
      </div>
    );
  }

  const errorList = Object.entries(errors);
  const lines = AUDIENCE_LINES[audience];

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6" aria-label="Build slot application">
      <div ref={summaryRef} tabIndex={-1} role="alert" className={formError ? "rounded-lg border border-red-800 bg-white p-4 text-red-800" : "sr-only"}>
        {formError ? (
          <>
            <p className="font-medium">{formError}</p>
            {errorList.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {errorList.map(([key, message]) => (
                  <li key={key}>
                    <a href={`#${key}`} className="underline">{message}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>

      <Field id="line" label="What do you want built?" error={errors.line}>
        <select {...text("line")} defaultValue="">
          <option value="" disabled>Choose one</option>
          {lines.map((line) => (
            <option key={line} value={line}>{LINE_LABELS[line]}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="fullName" label="Your name" error={errors.fullName}>
          <input type="text" autoComplete="name" {...text("fullName")} />
        </Field>
        <Field id="email" label="Work email" error={errors.email}>
          <input type="email" autoComplete="email" {...text("email")} />
        </Field>
        <Field id="role" label="Your role" error={errors.role}>
          <input type="text" autoComplete="organization-title" {...text("role")} />
        </Field>
        <Field id="organization" label={audience === "companies" ? "Company" : "Startup or project name"} error={errors.organization}>
          <input type="text" autoComplete="organization" {...text("organization")} />
        </Field>
        <Field id="website" label="Website (optional)" error={errors.website}>
          <input type="url" inputMode="url" placeholder="https://" {...text("website")} />
        </Field>
        <Field id="country" label="Country of registration" error={errors.country}>
          <input type="text" autoComplete="country-name" {...text("country")} />
        </Field>
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium text-espresso">Can you sign a commercial agreement for this?</legend>
        <div className="flex gap-6">
          {(["yes", "no"] as const).map((value) => (
            <label key={value} className="flex items-center gap-2 text-espresso">
              <input type="radio" name="canSign" value={value} checked={canSign === value} onChange={() => setCanSign(value)} className="size-4 accent-gold-dark" />
              {value === "yes" ? "Yes" : "No, someone else signs"}
            </label>
          ))}
        </div>
        {canSign === "no" ? (
          <Field id="signerContact" label="Name and role of the person who signs" error={errors.signerContact}>
            <input type="text" {...text("signerContact")} />
          </Field>
        ) : null}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="profile" label={audience === "companies" ? "Company size" : "Stage"} error={errors.profile}>
          <select {...text("profile")} defaultValue="">
            <option value="" disabled>Choose one</option>
            {PROFILE_OPTIONS[audience].map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field id="budgetRange" label="Budget you could agree if the build passes" error={errors.budgetRange}>
          <select {...text("budgetRange")} defaultValue="">
            <option value="" disabled>Choose one</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id="dealStructure"
        label="How would you expect to pay if the build meets your Spec?"
        hint={audience === "startups" ? "Equity deals depend on the stage and strength of the idea and the team. We assess that before agreeing one." : undefined}
        error={errors.dealStructure}
      >
        <select {...text("dealStructure")} aria-describedby={describedBy("dealStructure", audience === "startups" ? "x" : undefined, errors.dealStructure)} defaultValue="">
          <option value="" disabled>Choose one</option>
          {DEAL_OPTIONS[audience].map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      <Field
        id="description"
        label="What should we build, and what outcome means success?"
        hint="3 to 6 sentences. For Modernize: current stack, rough size of the codebase and where it is hosted."
        error={errors.description}
      >
        <textarea rows={6} maxLength={2000} {...text("description")} aria-describedby={describedBy("description", "x", errors.description)} />
      </Field>

      <Field id="systems" label="Systems it must connect to (optional)" hint="And whether you have API or sandbox access today." error={errors.systems}>
        <textarea rows={3} maxLength={500} {...text("systems")} aria-describedby={describedBy("systems", "x", errors.systems)} />
      </Field>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium text-espresso">Does it involve a regulated or safety-critical domain, or sensitive personal data?</legend>
        <div className="flex gap-6">
          {(["no", "yes"] as const).map((value) => (
            <label key={value} className="flex items-center gap-2 text-espresso">
              <input type="radio" name="regulated" value={value} checked={regulated === value} onChange={() => setRegulated(value)} className="size-4 accent-gold-dark" />
              {value === "yes" ? "Yes" : "No"}
            </label>
          ))}
        </div>
        {regulated === "yes" ? (
          <Field id="regulatedDetail" label="Which domain, and what data?" error={errors.regulatedDetail}>
            <input type="text" {...text("regulatedDetail")} />
          </Field>
        ) : null}
      </fieldset>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="companyFax">Leave this field empty</label>
        <input id="companyFax" name="companyFax" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-3">
        <label className="flex items-start gap-3 text-espresso">
          <input type="checkbox" name="commitment" id="commitment" aria-invalid={errors.commitment ? true : undefined} aria-describedby={describedBy("commitment", undefined, errors.commitment)} className="mt-1 size-4 accent-gold-dark" />
          <span>A decision maker can join the Spec call and answer questions within two business days.</span>
        </label>
        {errors.commitment ? <p id="commitment-error" className="text-sm font-medium text-red-800">{errors.commitment}</p> : null}
        <label className="flex items-start gap-3 text-espresso">
          <input type="checkbox" name="consent" id="consent" aria-invalid={errors.consent ? true : undefined} aria-describedby={describedBy("consent", undefined, errors.consent)} className="mt-1 size-4 accent-gold-dark" />
          <span>
            I agree that Monoes may contact me about this application. I can withdraw at any time. See the{" "}
            <Link href="/privacy" className="underline underline-offset-2">privacy notice</Link>.
          </span>
        </label>
        {errors.consent ? <p id="consent-error" className="text-sm font-medium text-red-800">{errors.consent}</p> : null}
      </div>

      <div>
        <button
          type="submit"
          disabled={phase === "sending"}
          className="rounded-full bg-espresso px-7 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-espresso-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark disabled:opacity-60"
        >
          {phase === "sending" ? "Sending…" : "Apply for a build slot"}
        </button>
        <p className="mt-4 max-w-xl text-sm text-espresso/75">
          {DISCLOSURE}{" "}
          <Link href={TERMS_PATH} className="font-medium underline underline-offset-2">Terms apply</Link>.
        </p>
      </div>
    </form>
  );
}
