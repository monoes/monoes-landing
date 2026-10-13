import { z } from "zod";

// Real, current operating limit: applications are accepted into the waitlist once
// this many builds are running in parallel.
export const MAX_PARALLEL_BUILDS = 100;

export const AUDIENCES = ["companies", "startups"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const LINES = ["modernize", "flow", "launch"] as const;
export type Line = (typeof LINES)[number];

export const LINE_LABELS: Record<Line, string> = {
  modernize: "Modernize: move a legacy stack to a modern one",
  flow: "Flow: build process automations",
  launch: "Launch: research to a complete product",
};

export const AUDIENCE_LINES: Record<Audience, readonly Line[]> = {
  companies: ["modernize", "flow", "launch"],
  startups: ["launch", "flow"],
};

export const PROFILE_OPTIONS: Record<Audience, readonly { value: string; label: string }[]> = {
  companies: [
    { value: "1-49", label: "1 to 49 people" },
    { value: "50-249", label: "50 to 249 people" },
    { value: "250-999", label: "250 to 999 people" },
    { value: "1000+", label: "1,000 or more people" },
  ],
  startups: [
    { value: "idea", label: "Idea stage, not funded" },
    { value: "bootstrapped", label: "Bootstrapped with revenue" },
    { value: "pre-seed", label: "Pre-seed funded" },
    { value: "seed", label: "Seed funded" },
    { value: "series-a-plus", label: "Series A or later" },
  ],
};

export const DEAL_OPTIONS: Record<Audience, readonly { value: string; label: string }[]> = {
  companies: [
    { value: "cash", label: "Cash payment" },
    { value: "discuss", label: "Not sure, let's discuss" },
  ],
  startups: [
    { value: "cash", label: "Cash payment" },
    { value: "cash_equity", label: "Cash plus equity" },
    { value: "equity_only", label: "Equity only" },
    { value: "discuss", label: "Not sure, let's discuss" },
  ],
};

export const BUDGET_OPTIONS = [
  { value: "under-10k", label: "Under 10,000 EUR" },
  { value: "10k-50k", label: "10,000 to 50,000 EUR" },
  { value: "50k-150k", label: "50,000 to 150,000 EUR" },
  { value: "150k-plus", label: "Over 150,000 EUR" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as [string, ...string[]];

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(min, min === 1 ? `${label} is required.` : `${label} needs at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .transform((v) => (v ? v : undefined));

const allProfileValues = [...PROFILE_OPTIONS.companies, ...PROFILE_OPTIONS.startups].map((o) => o.value);
const allDealValues = [...DEAL_OPTIONS.startups].map((o) => o.value);

const websiteField = z
  .string()
  .trim()
  .max(200, "Website must be 200 characters or fewer.")
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine(
    (v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return u.protocol === "https:" || u.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Enter a full website address starting with https://" },
  );

export const applicationSchema = z
  .object({
    audience: z.enum(AUDIENCES, { error: "Unknown audience." }),
    line: z.enum(LINES, { error: "Choose what you want built." }),
    fullName: text("Your name", 2, 100),
    email: z.email("Enter a valid email address.").max(200, "Email must be 200 characters or fewer."),
    role: text("Your role", 2, 100),
    organization: text("Company or project name", 2, 150),
    website: websiteField,
    country: text("Country of registration", 2, 80),
    canSign: z.enum(["yes", "no"], { error: "Tell us whether you can sign." }),
    signerContact: optionalText("Signer details", 200),
    profile: z.enum(allProfileValues as [string, ...string[]], { error: "Choose an option." }),
    dealStructure: z.enum(allDealValues as [string, ...string[]], { error: "Choose how you would expect to pay." }),
    budgetRange: z.enum(values(BUDGET_OPTIONS), { error: "Choose a budget range." }),
    description: text("Description", 40, 2000),
    regulated: z.enum(["yes", "no"], { error: "Tell us whether a regulated domain is involved." }),
    regulatedDetail: optionalText("Regulated domain details", 500),
    systems: optionalText("Systems", 500),
    commitment: z.literal(true, { error: "Please confirm a decision maker is available." }),
    consent: z.literal(true, { error: "Consent is required so we can contact you." }),
  })
  .superRefine((data, ctx) => {
    if (!AUDIENCE_LINES[data.audience].includes(data.line)) {
      ctx.addIssue({ code: "custom", path: ["line"], message: "That option is not available on this page." });
    }
    if (!PROFILE_OPTIONS[data.audience].some((o) => o.value === data.profile)) {
      ctx.addIssue({ code: "custom", path: ["profile"], message: "Choose an option." });
    }
    if (!DEAL_OPTIONS[data.audience].some((o) => o.value === data.dealStructure)) {
      ctx.addIssue({ code: "custom", path: ["dealStructure"], message: "Choose how you would expect to pay." });
    }
    if (data.canSign === "no" && !data.signerContact) {
      ctx.addIssue({
        code: "custom",
        path: ["signerContact"],
        message: "Give the name and role of the person who can sign.",
      });
    }
    if (data.regulated === "yes" && !data.regulatedDetail) {
      ctx.addIssue({ code: "custom", path: ["regulatedDetail"], message: "Describe the regulated domain." });
    }
  });

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type FieldErrors = Record<string, string>;

export type ValidationResult =
  | { ok: true; data: ApplicationInput }
  | { ok: false; fieldErrors: FieldErrors };

export function validateApplication(input: unknown): ValidationResult {
  const result = applicationSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors };
}
