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
    timeline: "1–5 days",
    outcome: "Pick the highest-ROI process (or map several); define success and expected ROI.",
  },
  {
    phase: "Pilot",
    timeline: "3–6 weeks",
    outcome: "Connect your systems, set approval rules, run the first worker in parallel.",
  },
  {
    phase: "Expand & build trust",
    timeline: "1–3 months",
    outcome: "Raise the automation rate; add a second and third worker.",
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
  mailSubject: string;
}

export const discoveryPackages: DiscoveryPackage[] = [
  {
    id: "1-day",
    name: "1-Day Discovery",
    price: "$3,000",
    duration: "1 day",
    description:
      "A focused audit of a single team or process. We spend a day with the people who do the work, then hand you a findings report.",
    deliverables: [
      "One process mapped end-to-end",
      "The single highest-ROI automation opportunity identified",
      "Findings report with a recommended pilot scope",
    ],
    mailSubject: "Monoes Workforce: 1-Day Discovery",
  },
  {
    id: "5-day",
    name: "5-Day Discovery",
    price: "$12,000",
    duration: "5 days",
    description:
      "A full audit across departments. We interview managers and staff, map processes, and rank the opportunities we find.",
    deliverables: [
      "Multi-department process map (Finance, Ops, HR, Sales, Support)",
      "Ranked opportunity backlog with estimated ROI per process",
      "Prioritized implementation roadmap",
    ],
    mailSubject: "Monoes Workforce: 5-Day Discovery",
  },
];

export const discoveryContactEmail = "nokhodian@gmail.com";

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

Extraction Accuracy: 99.2%
Vendor Matching:     98.7%
PO Matching:         99.1%
Auto-processing:     82%
Exception Rate:      4.3%
Human Override:      3.1%`;

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
      detail: "Applies to the first paid pilot and rollout after your Discovery audit.",
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
