import type { Audience, Line } from "./build-first";

export const TERMS_PATH = "/build-first/terms";
export const OFFER_LINE = "No upfront payment. You pay only if the build meets every requirement in your Acceptance Spec.";
export const OFFER_LINE_EQUITY = "No upfront payment. We are paid only if the build meets your Acceptance Spec.";
export const DISCLOSURE =
  "If every requirement passes, you proceed on the terms agreed beforehand, or a Build Fee applies.";

export interface SpecRow {
  id: string;
  requirement: string;
  steps: string;
  expected: string;
  status: "Pass" | "Fail" | "Not run";
}

export interface BuildFirstContent {
  audience: Audience;
  path: string;
  metaTitle: string;
  metaDescription: string;
  heroLead: string;
  heroAccent: string;
  heroSub: string;
  steps: { title: string; body: string }[];
  specIntro: string;
  specRows: SpecRow[];
  specCaption: string;
  forYou: string[];
  notForYou: string[];
  lines: { id: Line; name: string; body: string }[];
  faq: { q: string; a: string }[];
  formTitle: string;
  formIntro: string;
  finalHeadline: string;
  finalBody: string;
}

const sharedNotFor = [
  "Hardware, or work that needs production credentials or production data before you sign.",
  "Open-ended exploration with no testable end state. If a requirement cannot be tested, it cannot go in the Spec.",
];

export const companies: BuildFirstContent = {
  audience: "companies",
  path: "/build-first/companies",
  metaTitle: "Build First for companies: modernize, automate or build, and pay only if it passes",
  metaDescription:
    "No upfront payment. Monoes builds your stack modernization, automation or product against a written Acceptance Spec in staging. You pay only if the build meets every requirement.",
  heroLead: "Modernize your stack.",
  heroAccent: "Pay only if it meets your Spec.",
  heroSub:
    "We write an Acceptance Spec with you, build against it in a staging environment, and you test the result with your own checklist. Stack modernization, process automation or a new product.",
  steps: [
    {
      title: "Write the Acceptance Spec together",
      body: "A 60 to 90 minute call produces a checklist. Every row has exact test steps and an expected result. You sign it before any work starts, and the price is agreed in writing at the same time.",
    },
    {
      title: "We build it in staging",
      body: "Monoes and vetted contributors build against the frozen Spec. You get named access to a staging environment we control. No production data and no production access are involved.",
    },
    {
      title: "You run the checklist",
      body: "If every row passes, we move on to the agreed terms. If a row fails, we get one fix cycle. If it still fails, you owe nothing and the staging build is taken down.",
    },
  ],
  specIntro:
    "The Acceptance Spec is the whole offer. It replaces the opinion of what counts as done with a list your team can run. Here is the shape of a Modernize Spec.",
  specRows: [
    {
      id: "S-01",
      requirement: "Every endpoint returns the same response on the new build as on the legacy system.",
      steps: "Replay the agreed golden request set against both systems and diff the responses.",
      expected: "No differences in the agreed fields.",
      status: "Pass",
    },
    {
      id: "S-02",
      requirement: "The order export page meets the agreed load time.",
      steps: "Measure on the agreed reference device and network with the agreed tool.",
      expected: "Result is at or under the agreed threshold.",
      status: "Pass",
    },
    {
      id: "S-03",
      requirement: "Your existing automated test suite passes.",
      steps: "Run the suite from the staging repository.",
      expected: "Zero failures.",
      status: "Fail",
    },
    {
      id: "S-04",
      requirement: "The dependency scan reports no critical vulnerabilities.",
      steps: "Run the agreed scanner on the delivered build.",
      expected: "Zero critical findings.",
      status: "Not run",
    },
  ],
  specCaption:
    "Illustrative example of a Spec, not a real client's. Real Specs are written with you and may be longer.",
  forYou: [
    "You have an aging system, a manual process or a product idea, and a named person who can sign off.",
    "You can pay the agreed price if the build meets your Spec.",
    "Someone can join Spec calls and answer questions within two business days.",
    "You can write down what success looks like, with our help.",
  ],
  notForYou: [
    ...sharedNotFor,
    "Companies that want AI digital workers deployed on their existing ERP and CRM. That is Monoes Workforce.",
  ],
  lines: [
    {
      id: "modernize",
      name: "Modernize",
      body: "Move a legacy stack to a modern one for performance, efficiency and maintainability, with behaviour parity as the pass test.",
    },
    {
      id: "flow",
      name: "Flow",
      body: "Build process automations from scratch, with the approval and error paths written into the Spec.",
    },
    {
      id: "launch",
      name: "Launch",
      body: "From research to a complete product, with user stories turned into scripted acceptance flows.",
    },
  ],
  faq: [
    {
      q: "What is the catch? Nobody builds for free.",
      a: "The build costs you nothing until you accept it. We carry that cost because we expect to be chosen when a build meets your Spec. The conditions are public: we qualify applicants, scope is bounded, the Spec is signed first, the build stays in staging, and if every row passes you proceed on the agreed terms or a Build Fee applies. The full conditions are in the terms.",
    },
    {
      q: "Who decides whether it passes? Will you just say it is fine?",
      a: "You do, through your own internal sign-off. The Spec is the checklist: each row has test steps and an expected result, and a row passes only when the steps produce that result. Preferences and new ideas that were not in the Spec go into the paid backlog and do not count as failures.",
    },
    {
      q: "What about our data and security?",
      a: "We never need production data or production access before you sign. The build runs on synthetic or sample data in a staging environment we control, under a mutual NDA, with access logging. For Modernize we need your source code: it stays yours, and we delete it and anything derived from it if you do not accept.",
    },
    {
      q: "What does it cost if it passes, and are we locked in?",
      a: "The price is agreed in writing before work starts, so there is no surprise after a pass. How it is charged depends on the line: Modernize is priced from the size of the code, Flow per live automation, Launch per product. Details are in the terms. Support after handover is optional and quoted separately.",
    },
    {
      q: "Can you actually build this?",
      a: "Within the scope we agree, yes, and we say no early if something is out of scope. You can inspect our open-source engineering today, linked in the trust section below.",
    },
    {
      q: "Who does the work?",
      a: "The Monoes team and vetted contributors under confidentiality and IP agreements. Monoes reviews everything before you see it. Where personal data is involved, a data processing agreement covers it.",
    },
    {
      q: "How is this different from Monoes Workforce?",
      a: "Workforce deploys AI digital workers on your existing ERP and CRM, starting with a Discovery audit that you pay for after delivery. Build First is for modernization, new automations and new products, where we build first and are paid only if the build passes.",
    },
  ],
  formTitle: "Apply for a build slot",
  formIntro:
    "Ten questions. We review every application ourselves and reply within two business days. Applying costs nothing and commits you to nothing.",
  finalHeadline: "Run the checklist before you commit.",
  finalBody:
    "If a build meeting your own written requirements would change how you decide, apply for a slot.",
};

export const startups: BuildFirstContent = {
  audience: "startups",
  path: "/build-first/startups",
  metaTitle: "Build First for startups and founders: ship it, and we are paid only if it passes",
  metaDescription:
    "No upfront payment. Monoes builds your product or automation against a spec you sign, in staging. Pay in cash, cash plus equity, or equity only, and only if the build passes.",
  heroLead: "Ship your product.",
  heroAccent: "We're paid only if it passes your spec.",
  heroSub:
    "Your runway is not our test budget. You write the spec with us, we build it, you test it. Pay in cash, cash plus equity, or equity only.",
  steps: [
    {
      title: "Write the spec with us",
      body: "One call, one checklist. Each row is something you can click through or run, with an expected result. You sign it, and we agree how we get paid before we build.",
    },
    {
      title: "We build it in staging",
      body: "You get a working build to use, in an environment we control. We keep the code until you sign. A mutual NDA covers your idea from the first call.",
    },
    {
      title: "You decide with a checklist",
      body: "Every row passes: we move on to the agreed deal. A row fails and we cannot fix it in one cycle: you owe nothing. No pitch decks, no hours billed.",
    },
  ],
  specIntro:
    "The spec is how a build stops being a matter of taste. These are the kinds of rows a Launch spec contains.",
  specRows: [
    {
      id: "S-01",
      requirement: "A visitor can sign up with an email address and verify it.",
      steps: "Open the signup page, submit an email, click the link in the verification email.",
      expected: "The account is active and the user lands on the dashboard.",
      status: "Pass",
    },
    {
      id: "S-02",
      requirement: "A signed-in user can create a project and see it in their list.",
      steps: "Click New project, enter a name, save, open the list.",
      expected: "The project appears in the list with the entered name.",
      status: "Pass",
    },
    {
      id: "S-03",
      requirement: "A test-mode card payment creates an order.",
      steps: "Check out with the provider's test card.",
      expected: "An order with status Paid appears in the admin view.",
      status: "Fail",
    },
    {
      id: "S-04",
      requirement: "The agreed pages pass the agreed accessibility checks.",
      steps: "Run the agreed automated accessibility checker on the listed pages.",
      expected: "Zero serious or critical findings.",
      status: "Not run",
    },
  ],
  specCaption:
    "Illustrative example of a spec, not a real founder's. Yours is written with you around your product.",
  forYou: [
    "You are an incorporated startup, or ready to incorporate before signing, with a founder who can sign.",
    "You have funding or revenue, or an idea we judge strong enough for an equity-based deal.",
    "You can join the spec call and answer questions within two business days.",
    "You want a working product, not a prototype for a pitch.",
  ],
  notForYou: [
    ...sharedNotFor,
    "Anyone looking for work with no payment in any form. Equity is payment, and we assess the idea, the stage and the team before agreeing an equity deal.",
  ],
  lines: [
    {
      id: "launch",
      name: "Launch",
      body: "From research to a complete product. Paid in cash, cash plus equity, or equity only, set before the build.",
    },
    {
      id: "flow",
      name: "Flow",
      body: "Process automations built from scratch for your team, charged per live automation after you accept.",
    },
  ],
  faq: [
    {
      q: "Do you take my idea?",
      a: "No. A mutual NDA covers your idea from the first call, your brand and materials stay yours, and the Launch conversion agreement assigns the IP to you when you pay or the equity is issued. Until then we hold the staging build.",
    },
    {
      q: "What if you take forever?",
      a: "The build window is written into the spec. If it depends on something from you, such as access or content, the clock pauses until it arrives, and that is stated up front.",
    },
    {
      q: "What if I love it but cannot afford it?",
      a: "You tell us your budget range when you apply, and the deal is agreed before the build. If every row passes and you decline, a Build Fee applies, and it is in the terms. Better to hear that now than after the build.",
    },
    {
      q: "Is it a toy MVP I cannot extend?",
      a: "Scope is bounded to the spec and delivered as a working product. Handover includes the source and a warranty on the spec rows. New features are a paid next phase, not a surprise.",
    },
    {
      q: "Why would you do this?",
      a: "To earn trust without asking for it. We are paid when your build passes, so we write the spec carefully and build to it. We run a limited number of builds in parallel, so if we are full you join a real waitlist.",
    },
    {
      q: "How does the equity option work?",
      a: "It depends on how far along the idea is, how strong it is and who the founders are. We look at those first, then propose cash, cash plus equity or equity only, with the details written before the build. A written agreement covers any equity.",
    },
    {
      q: "Who does the work?",
      a: "The Monoes team and vetted contributors under confidentiality and IP agreements, with Monoes reviewing everything before you see it.",
    },
  ],
  formTitle: "Apply for a build slot",
  formIntro:
    "Ten questions. We review every application ourselves and reply within two business days. Applying costs nothing and commits you to nothing.",
  finalHeadline: "Your runway stays yours.",
  finalBody:
    "Write the spec, test the build, then decide. Apply for a slot and tell us what you want shipped.",
};
