export interface ValueProp {
  title: string;
  description: string;
}

export const valueProps: ValueProp[] = [
  {
    title: "Lower operational costs",
    description: "Digital workers run 24/7 without payroll, benefits, or overtime.",
  },
  {
    title: "Higher employee productivity",
    description: "Your team stops doing data entry and starts doing judgment work.",
  },
  {
    title: "End-to-end automation",
    description: "Not a single step handed off: the whole process, start to finish.",
  },
  {
    title: "Faster operations",
    description: "Invoices, approvals, and follow-ups move at machine speed, not queue speed.",
  },
  {
    title: "Fewer human errors",
    description: "Consistent rules applied every time, with an audit trail behind every action.",
  },
  {
    title: "Scale without linear headcount",
    description: "Growth stops requiring a proportional hiring plan for back-office work.",
  },
];

export interface Capability {
  department: string;
  workers: string[];
}

export const capabilities: Capability[] = [
  {
    department: "Finance & Accounting",
    workers: ["Invoice processing", "Reconciliation", "AR follow-up"],
  },
  {
    department: "Procurement & Purchasing",
    workers: ["Vendor management", "3-way match", "PO tracking"],
  },
  {
    department: "HR / Human Capital",
    workers: ["Onboarding", "Document collection", "Payroll support"],
  },
  {
    department: "Customer Service & Helpdesk",
    workers: ["Ticket triage", "FAQ resolution", "Escalation routing"],
  },
  {
    department: "Sales & CRM",
    workers: ["Lead follow-up", "Pipeline hygiene", "Quote generation"],
  },
  {
    department: "Business Intelligence & Reporting",
    workers: ["Executive dashboards", "Ad-hoc reports", "KPI tracking"],
  },
];

export interface EngagementPhase {
  phase: string;
  timeline: string;
  outcome: string;
}

export const engagementPhases: EngagementPhase[] = [
  {
    phase: "Discovery",
    timeline: "1 day or 1 week",
    outcome: "Receive the research: process documentation, org charts, bottlenecks, a suggested solution and an automation for each. You pay after delivery.",
  },
  {
    phase: "Expand & build trust",
    timeline: "1–3 months",
    outcome: "Take the automations live on your systems, raise the automation rate, add more workers.",
  },
  {
    phase: "Scale",
    timeline: "Ongoing",
    outcome: "New processes become configuration, not new projects.",
  },
];

export interface DiscoveryPackage {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  deliverables: string[];
  cta: string;
  mailSubject: string;
}

export const discoveryPackages: DiscoveryPackage[] = [
  {
    id: "1-day",
    name: "1-Day Discovery",
    price: "$3,000",
    duration: "1 day",
    description:
      "A focused look at a single team or process. We spend a day with the people who do the work, then deliver the research and the automations.",
    deliverables: [
      "Process documentation: the process mapped end-to-end, step by step",
      "Org chart of the people and roles involved",
      "The bottlenecks, identified and ranked",
      "A suggested solution for each bottleneck",
      "An automation for each bottleneck",
    ],
    cta: "Book the 1-day audit",
    mailSubject: "Monoes Workforce: 1-Day Discovery",
  },
  {
    id: "5-day",
    name: "5-Day Discovery",
    price: "$12,000",
    duration: "5 days",
    description:
      "The same research across departments. We interview managers and staff, then deliver the findings and the automations.",
    deliverables: [
      "Process documentation across departments (Finance, Ops, HR, Sales, Support)",
      "Org charts of the teams and roles involved",
      "The bottlenecks in each process, identified and ranked",
      "A suggested solution for each bottleneck",
      "An automation for each bottleneck",
      "A prioritized implementation roadmap",
    ],
    cta: "Book the 5-day audit",
    mailSubject: "Monoes Workforce: 5-Day Discovery",
  },
  {
    id: "sme",
    name: "SME Discovery",
    price: "From $15,000",
    duration: "Scoped to your business",
    description:
      "For small and mid-sized businesses. We discover how your business really runs and chart all of it. The price scales with the number of processes in scope. Research only: no bottleneck analysis, solutions or automations.",
    deliverables: [
      "Discovery of your processes: every process in scope identified and described",
      "A chart of every process, end to end",
      "Process documentation for each one",
      "Org chart of the teams and roles involved",
    ],
    cta: "Book SME Discovery",
    mailSubject: "Monoes Workforce: SME Discovery",
  },
];

export const discoveryPaymentNote =
  "You pay after delivery, not before. We invoice when the research and the automations are delivered to you.";

export interface DeliveryItem {
  title: string;
  detail: string;
}

export interface DeliveryPack {
  id: string;
  name: string;
  summary: string;
  items: DeliveryItem[];
}

export const deliveryPacks: DeliveryPack[] = [
  {
    id: "1-day",
    name: "1-Day delivery pack",
    summary: "One process, studied in a day and handed over as documents and automations.",
    items: [
      {
        title: "Process documentation",
        detail: "A written, step-by-step record of the process we studied: inputs, outputs, systems, handoffs and the rules people apply.",
      },
      {
        title: "Org chart",
        detail: "Who is involved in the process: roles, owners and approvers, and how work moves between them.",
      },
      {
        title: "Bottleneck report",
        detail: "Where the process slows down or breaks, ranked, with what we observed behind each one.",
      },
      {
        title: "Solution suggestions",
        detail: "A recommended fix for each bottleneck, with what it needs from your systems and your people.",
      },
      {
        title: "Automations",
        detail: "One automation for each bottleneck, handed over for you to review.",
      },
    ],
  },
  {
    id: "5-day",
    name: "5-Day delivery pack",
    summary: "The same research across departments, plus the plan for what to build next.",
    items: [
      {
        title: "Process documentation",
        detail: "A written record of each process we studied across Finance, Ops, HR, Sales and Support.",
      },
      {
        title: "Org charts",
        detail: "The teams and roles involved in each process, with owners and approvers.",
      },
      {
        title: "Bottleneck report",
        detail: "The bottlenecks in every process we studied, ranked, with what we observed behind each one.",
      },
      {
        title: "Solution suggestions",
        detail: "A recommended fix for each bottleneck.",
      },
      {
        title: "Automations",
        detail: "One automation for each bottleneck, handed over for you to review.",
      },
      {
        title: "Ranked opportunity backlog",
        detail: "Every opportunity we found across departments, in priority order.",
      },
      {
        title: "Implementation roadmap",
        detail: "A prioritized plan for what to build next and in what order.",
      },
    ],
  },
  {
    id: "sme",
    name: "SME Discovery delivery pack",
    summary: "Discovery and charting only. Bottlenecks, solutions and automations are in the 1-Day and 5-Day packs.",
    items: [
      {
        title: "Process discovery",
        detail: "Every process in scope identified and described: who does it, which systems it touches and how often it runs.",
      },
      {
        title: "Process charts",
        detail: "Each process charted end to end, so you can see every step and handoff on one page.",
      },
      {
        title: "Process documentation",
        detail: "A written record of each process: inputs, outputs, systems, handoffs and the rules people apply.",
      },
      {
        title: "Org chart",
        detail: "The teams and roles involved in the processes, with owners and approvers.",
      },
    ],
  },
];

export const discoveryContactEmail = "hello@monoes.me";

export const pilotBracketNote =
  "SME Discovery starts at $15,000 and scales with the number of processes in scope. It is a fixed price agreed before work starts and, like the others, paid after delivery. Implementation is scoped and quoted after the research is delivered - no open-ended billing.";

export const discoveryEmailBody =
  "Tell us a little about your business and the process you'd like to automate:\n\n- Company name:\n- Team size:\n- Systems you run (ERP / CRM / email):\n- The process that eats the most time:\n- Preferred Discovery package (1-Day $3,000 / 5-Day $12,000 / SME Discovery from $15,000):\n";

export interface HumanInLoopLevel {
  level: number;
  name: string;
  description: string;
}

export const humanInLoopLevels: HumanInLoopLevel[] = [
  { level: 0, name: "Manual", description: "A human does everything." },
  { level: 1, name: "AI Copilot", description: "The AI recommends; a human executes." },
  {
    level: 2,
    name: "AI Executes + Human Approval",
    description: "The AI performs the work but waits for approval on important actions.",
  },
  {
    level: 3,
    name: "Autonomous Execution",
    description: "The AI executes authorized work without approval.",
  },
  {
    level: 4,
    name: "Autonomous Exception Handling",
    description: "The AI handles selected exceptions on its own.",
  },
];

export interface ArchitectureLayer {
  name: string;
  role: string;
  description: string;
}

export const architectureLayers: ArchitectureLayer[] = [
  {
    name: "Workflow",
    role: "Deterministic process controller",
    description: "Defines the steps a process moves through, in order, every time.",
  },
  {
    name: "Agent",
    role: "The reasoning brain of some steps",
    description: "Reads, extracts, classifies, and decides, but only within a step the Workflow hands it.",
  },
  {
    name: "Policy",
    role: "Deterministic \"what's allowed\"",
    description: "Rules like \"invoice over $20,000 requires approval\": versioned, auditable, testable, kept separate from the Agent's judgment.",
  },
  {
    name: "Connector",
    role: "Standard bridge to external systems",
    description: "The bridge to your ERP, CRM, email, or spreadsheets (swappable without touching the process logic).",
  },
];

export const processDefinitionExample = `{
  "process": "invoice_processing",
  "trigger": "invoice_received",
  "steps": [
    { "type": "extract_document" },
    { "type": "validate_vendor" },
    { "type": "match_po" },
    { "type": "decision", "rule": "variance < 0.05" },
    { "type": "approval" },
    { "type": "erp_action" }
  ]
}`;

export const evaluationMetricsExample = `AP Agent

Extraction Accuracy: [measured per engagement]
Vendor Matching:     [measured per engagement]
PO Matching:         [measured per engagement]
Auto-processing:     [measured per engagement]
Exception Rate:      [measured per engagement]
Human Override:      [measured per engagement]`;

export const connectors = ["ERP", "CRM", "Email", "Excel / CSV", "Accounting", "Ticketing"];
export interface CapabilityCategory {
  department: string;
  agents: string[];
}

export const capabilityCatalog: CapabilityCategory[] = [
  {
    department: "Finance & Accounting",
    agents: ["GL Posting Agent", "AP Automation Agent", "AR Collections Agent", "Bank Reconciliation Agent", "Fixed Asset Agent", "Budget Variance Agent", "Consolidation Agent", "Tax Compliance Agent", "Cost Accounting Agent", "Period Close Agent", "Financial Reporting Agent", "Audit Trail Agent", "Expense Audit Agent", "Notes Tracking Agent"],
  },
  {
    department: "Treasury & Cash Management",
    agents: ["Cash Flow Forecasting Agent", "FX Risk Agent", "Working Capital Agent", "Bank Relationship Agent", "Investment Allocation Agent"],
  },
  {
    department: "Sales & CRM",
    agents: ["Lead Scoring Agent", "Opportunity Nudge Agent", "Quote-to-Order Agent", "Sales Contract Agent", "Dynamic Pricing Agent", "Sales Forecasting Agent", "Customer Segmentation Agent", "Loyalty Rewards Agent", "Commission Calculation Agent", "Territory Assignment Agent", "Sales Performance Agent", "Churn Prevention Agent"],
  },
  {
    department: "Marketing",
    agents: ["Campaign Automation Agent", "Drip Sequence Agent", "Social Media Agent", "Event Management Agent", "Campaign ROI Agent", "Content Generation Agent", "A/B Testing Agent", "Customer Journey Agent"],
  },
  {
    department: "Procurement & Purchasing",
    agents: ["Vendor Scorecard Agent", "RFQ Agent", "Purchase Requisition Agent", "3-Way Match Agent", "Supplier Contract Agent", "Spend Analysis Agent", "Catalog Recommendation Agent", "Purchase Approval Agent", "Price Benchmarking Agent"],
  },
  {
    department: "Inventory & Warehouse Management",
    agents: ["Stock Sync Agent", "Barcode Capture Agent", "Inventory Valuation Agent", "Cycle Count Agent", "Auto-Replenishment Agent", "Lot Traceability Agent", "Warehouse Ops Agent", "Stock Transfer Agent", "Inventory Reconciliation Agent"],
  },
  {
    department: "Supply Chain & Logistics",
    agents: ["Demand Planning Agent", "Supplier Collaboration Agent", "Transportation Agent", "Distribution Planning Agent", "Customs Documentation Agent", "Shipment Tracking Agent"],
  },
  {
    department: "Manufacturing / Production",
    agents: ["BOM Management Agent", "Work Order Agent", "MRP Agent", "Shop Floor Monitoring Agent", "Capacity Planning Agent", "Subcontracting Agent", "Yield Tracking Agent"],
  },
  {
    department: "Quality Management",
    agents: ["Incoming QC Agent", "Non-conformance Agent", "Certification Renewal Agent", "Quality Audit Agent"],
  },
  {
    department: "Maintenance / EAM",
    agents: ["Preventive Maintenance Agent", "Repair Dispatch Agent", "Asset Lifecycle Agent", "Predictive Maintenance Agent"],
  },
  {
    department: "HR / Human Capital Management",
    agents: ["Employee Records Agent", "Resume Screening Agent", "Onboarding Agent", "Attendance Agent", "Leave Approval Agent", "Payroll Agent", "Performance Review Agent", "Training Recommendation Agent", "Succession Planning Agent", "Benefits Administration Agent", "Attendance-Payroll Reconciliation Agent"],
  },
  {
    department: "Project Management",
    agents: ["Project Scheduling Agent", "Task Assignment Agent", "Timesheet Agent", "Resource Allocation Agent", "Project Budget Agent", "Milestone Reporting Agent"],
  },
  {
    department: "Field Service Management",
    agents: ["Technician Scheduling Agent", "Route Optimization Agent", "Spare Parts Agent"],
  },
  {
    department: "Customer Service & Helpdesk",
    agents: ["Ticket Triage Agent", "SLA Monitoring Agent", "Knowledge Base Agent", "AI Live Chat Agent", "CSAT Analysis Agent"],
  },
  {
    department: "Point of Sale / POS",
    agents: ["POS Sales Agent", "Cash Shift Agent", "Promotion Engine Agent", "Real-time Stock Sync Agent"],
  },
  {
    department: "eCommerce",
    agents: ["Catalog Sync Agent", "Checkout Agent", "Order Fulfillment Agent", "Product Recommendation Agent"],
  },
  {
    department: "Document Management",
    agents: ["Document Archiving Agent", "e-Signature Agent", "Document Approval Agent", "OCR / IDP Agent"],
  },
  {
    department: "Legal, Compliance & Risk",
    agents: ["Contract Lifecycle Agent", "Compliance Monitoring Agent", "Risk Scoring Agent", "Internal Audit Agent"],
  },
  {
    department: "Business Intelligence & Reporting",
    agents: ["Executive Dashboard Agent", "KPI Monitoring Agent", "Report Builder Agent", "Predictive Analytics Agent", "Data Warehouse Agent"],
  },
  {
    department: "IT & Systems Integration",
    agents: ["Access Provisioning Agent", "Integration Agent", "Backup Agent", "System Health Agent"],
  },
  {
    department: "R&D / PLM",
    agents: ["Product Design Agent", "Engineering Change Agent", "Prototype Tracking Agent"],
  },
  {
    department: "Fleet Management",
    agents: ["Vehicle Tracking Agent", "Fleet Maintenance Agent"],
  },
  {
    department: "Facilities/Real Estate Management",
    agents: ["Lease Management Agent", "Space Planning Agent", "Facilities Cost Agent"],
  },
];

export interface FoundingClientTerm {
  label: string;
  detail: string;
}

export const foundingClientProgram = {
  slotsTotal: 3,
  discountPercent: 20,
  terms: [
    {
      label: "20% off implementation",
      detail: "Applies to the first paid implementation and rollout after your Discovery audit.",
    },
    {
      label: "Direct access to the person doing the work",
      detail: "No account manager layer. You work with whoever is actually building your workers.",
    },
    {
      label: "In exchange: a named reference",
      detail: "Once your first worker is live, you agree to be a public case study or reference call for future prospects.",
    },
  ] as FoundingClientTerm[],
  mailSubject: "Monoes Workforce: Founding Client Program",
};
