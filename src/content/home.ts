import { capabilityCatalog, humanInLoopLevels, engagementPhases } from "@/lib/workforce";

export const PLACEHOLDER_COPY = "src/content/home.ts";

export const hero = {
  lead: "Your company,",
  strong: "staffed",
  connector: "by",
  accent: "sunrise.",
  sub: "AI workers that finish your real business processes, from invoices to onboarding. Hire us to run them for you, or run them yourself for free.",
  primary: { label: "Hire your AI team", href: "#hire" },
  secondary: { label: "Run it yourself, free", href: "/product#projects" },
  claim: "Runs in your environment, on-prem or your own cloud. Your memory and audit trail stay with you, and only model calls leave, to a provider you choose or not at all with a local model.",
  boundary: { label: "Your environment", finale: "Your memory and audit trail never left." },
  finale: {
    lead: "AI workers for",
    accent: "every department.",
    sub: "Finance, HR, sales, support, operations. Pick how you want them.",
  },
};

export const heroDesks = capabilityCatalog.flatMap((c) =>
  c.agents.map((a) => a.replace(/ Agent$/, "")),
);

export interface TraceStep {
  name: string;
  body: string;
  gate?: boolean;
}

export interface TraceCase {
  id: string;
  label: string;
  title: [string, string];
  note: string;
  chip: string;
  steps: TraceStep[];
}

export const trace = {
  kicker: "Show the work",
  boundary: "Inside your environment · you choose what leaves",
  defaultId: "sales",
  cases: [
    {
      id: "sales",
      label: "Sales follow-up",
      title: ["A new lead comes in.", "A booked meeting comes out."],
      note: "Illustrative flow · Sales & CRM",
      chip: "✦",
      steps: [
        { name: "Capture", body: "The lead arrives from your form or inbox and is matched against your CRM so nobody is contacted twice." },
        { name: "Enrich", body: "Company, role and fit are filled in from public data, then scored against your ideal customer." },
        { name: "Draft", body: "A first message is written in your voice, using what the lead actually asked for." },
        { name: "Approve", body: "Messages to your key accounts wait for a rep. Everything else sends itself.", gate: true },
        { name: "Follow up", body: "Replies are tracked, nudges go out on schedule, and the meeting lands in your calendar." },
      ],
    },
    {
      id: "invoice",
      label: "Invoice processing",
      title: ["An invoice goes in.", "A posted, approved entry comes out."],
      note: "Illustrative flow · Accounts payable",
      chip: "✦",
      steps: [
        { name: "Receive", body: "An invoice lands in the shared AP inbox. A worker picks it up in seconds." },
        { name: "Extract", body: "Supplier, line items, tax and totals are read straight off the PDF." },
        { name: "Validate", body: "Matched against the purchase order and vendor master in your ERP." },
        { name: "Approve", body: "Above your threshold, a person signs off. Below it, it flows.", gate: true },
        { name: "Post", body: "The entry is posted to the ledger with a full audit trail attached." },
      ],
    },
    {
      id: "onboarding",
      label: "Employee onboarding",
      title: ["A new hire signs.", "A ready-to-work employee shows up."],
      note: "Illustrative flow · HR onboarding",
      chip: "✦",
      steps: [
        { name: "Receive", body: "The signed offer lands from recruiting. A worker opens the onboarding case in seconds." },
        { name: "Collect", body: "ID, bank details and tax forms are gathered from the new hire and checked for gaps." },
        { name: "Provision", body: "Accounts, payroll and equipment are set up in the systems you already run." },
        { name: "Approve", body: "Access to sensitive systems waits for the manager. Everything else flows.", gate: true },
        { name: "Welcome", body: "A first-week plan goes out, with an audit trail of everything that was set up." },
      ],
    },
    {
      id: "support",
      label: "Support triage",
      title: ["A ticket arrives.", "The right answer reaches the customer."],
      note: "Illustrative flow · Customer service",
      chip: "✦",
      steps: [
        { name: "Receive", body: "The ticket arrives from email or chat and is linked to the customer's history." },
        { name: "Classify", body: "Topic, urgency and sentiment are read, and angry or urgent cases jump the queue." },
        { name: "Resolve", body: "An answer is drafted from your help docs and the customer's order history." },
        { name: "Approve", body: "Refunds above your limit wait for a person. Routine answers go out on their own.", gate: true },
        { name: "Close", body: "The reply is sent, the ticket is logged, and recurring issues are tagged for review." },
      ],
    },
    {
      id: "purchasing",
      label: "Purchase requests",
      title: ["A purchase request is filed.", "An approved order reaches the supplier."],
      note: "Illustrative flow · Procurement",
      chip: "✦",
      steps: [
        { name: "Request", body: "A team member files what they need, in plain words, from wherever they already work." },
        { name: "Check", body: "Budget and your approved-supplier list are checked before anyone spends time on it." },
        { name: "Compare", body: "Quotes are gathered and ranked on price, delivery time and past performance." },
        { name: "Approve", body: "Orders above the limit wait for the budget owner. Smaller ones go straight through.", gate: true },
        { name: "Order", body: "The purchase order is sent, and the delivery is matched against it when it arrives." },
      ],
    },
  ] satisfies TraceCase[],
};

export const roster = {
  kicker: "The roster",
  title: "Named workers for every department.",
  linkLabel: "See the full catalog",
  linkHref: "/workforce/capabilities",
};

export const path = {
  kicker: "How it starts",
  title: ["From a one-day audit", "to a full AI team."],
  lede: "You never sign up for a big-bang project. Each step proves itself before the next one begins.",
  phases: engagementPhases,
};

export const hire = {
  kicker: "Monoes Workforce",
  title: ["We run it.", "Inside your walls."],
  body: "AI digital workers that execute your real business processes end to end, on the ERP, CRM and email you already run. We deploy them inside your environment, on-prem or in your own cloud. Start with a small, priced audit.",
  dialTitle: "You set the autonomy dial.",
  dialBody: "Choose how much the workers do on their own. Nothing irreversible happens above your line.",
  dialDefault: 2,
};

export const dialLevels = humanInLoopLevels;

export const beliefs = [
  { title: "On-prem or your cloud", body: "Deployed on your on-prem servers or in your own cloud account. Nothing runs on ours." },
  { title: "Your data stays put", body: "Documents, memory and the audit trail stay in your environment. Only model calls go out, to the provider you choose, or none with a local model." },
  { title: "Your model, your call", body: "Use the model you already trust, or opt in to a local one that we install or fine-tune for you." },
  { title: "A human on the risky calls", body: "You set where approval is required, and every decision is logged on your side." },
];

export const where = {
  kicker: "Local and private first",
  title: ["Where does your AI team", "actually run?"],
  lede: "Most AI workers live in a vendor's cloud, so your documents, your customers and your decisions pass through someone else's servers. Ours run in yours.",
  them: "Typical hosted AI workers",
  us: "Monoes",
  rows: [
    { label: "Where it runs", them: "Mostly the vendor's cloud", us: "Your on-prem servers or your own cloud" },
    { label: "Who handles your data", them: "Processed on the vendor's servers, and often passed on to third-party model providers", us: "Stays in your environment. Only model calls leave, to a provider you choose" },
    { label: "Which model", them: "Mostly the providers the vendor chose", us: "Your choice, including a local model we install or fine-tune for you" },
    { label: "If the vendor changes or closes", them: "Your workflows depend on the vendor staying put", us: "Keeps running. The core is open source" },
  ],
};

export const close = {
  lead: "Put AI workers",
  accent: "to work.",
  sub: "Start with a one-day audit of your busiest process, or run the open-source tools yourself, free.",
};
