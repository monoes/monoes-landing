// Ported from monomind's dashboard.html (_v2AvatarKnown/_v2AvatarCandidates/
// v2AvatarMapFor/v2RoleAvatar) — same built-in avatar SVGs (copied verbatim
// into public/org-avatars/), same candidate-matching and per-org dedup logic.

const AVATAR_BASE = "/org-avatars";

const KNOWN_AVATARS = new Set([
  "coder",
  "senior-developer",
  "reviewer",
  "tester",
  "planner",
  "researcher",
  "security-architect",
  "security-auditor",
  "threat-detection",
  "input-validator",
  "path-validator",
  "safe-executor",
  "hierarchical-coord",
  "mesh-coordinator",
  "adaptive-coordinator",
  "collective-coord",
  "queen-coordinator",
  "worker-specialist",
  "byzantine-coord",
  "raft-manager",
  "quorum-manager",
  "consensus-coordinator",
  "perf-analyzer",
  "benchmarker",
  "task-orchestrator",
  "memory-coordinator",
  "load-balancer",
  "resource-allocator",
  "pr-manager",
  "code-review-swarm",
  "issue-tracker",
  "release-manager",
  "repo-architect",
  "architecture",
  "refinement",
  "backend-dev",
  "frontend-developer",
  "mobile-dev",
  "ml-developer",
  "cicd-engineer",
  "system-architect",
  "ai-engineer",
  "model-qa",
  "data-engineer",
  "analytics-reporter",
  "experiment-tracker",
  "data-consolidator",
  "devops-automator",
  "sre",
  "incident-commander",
  "infrastructure",
  "database-optimizer",
  "cloud-architect",
  "prosecutor",
  "defender",
  "judge",
  "case-analyst",
  "trial-director",
  "legal-compliance",
  "technical-writer",
  "content-creator",
  "seo-specialist",
  "social-media",
  "email-marketing",
  "ai-citation",
  "product-manager",
  "sprint-prioritizer",
  "launch-strategist",
  "pricing-strategist",
  "feedback-synthesizer",
  "cro-specialist",
  "sales-engineer",
  "deal-strategist",
  "account-strategist",
  "outbound-strategist",
  "pipeline-analyst",
  "sales-coach",
  "support-responder",
  "discovery-coach",
  "proposal-strategist",
  "game-designer",
  "narrative-designer",
  "level-designer",
  "game-audio-engineer",
  "technical-artist",
  "unity-architect",
  "blockchain-auditor",
  "solidity-engineer",
  "zk-steward",
  "studio-producer",
  "project-shepherd",
  "senior-pm",
  "studio-operations",
  "workflow-architect",
  "adaptive-coordinator2",
  "api-tester",
  "evidence-collector",
  "reality-checker",
  "production-validator",
  "finance-tracker",
  "accounts-payable",
  "recruitment",
  "visionos-engineer",
  "embedded-firmware",
  "ios-developer",
  "mobile-app-builder",
  "mcp-builder",
  "automation-governance",
  "payment-agent",
  "compliance-auditor",
  "trend-researcher",
  "scout-explorer",
]);

const TYPE_FALLBACK: Record<string, string> = {
  planner: "planner",
  coordinator: "hierarchical-coord",
  researcher: "researcher",
  analyst: "researcher",
  reviewer: "reviewer",
  coder: "coder",
  tester: "tester",
  architect: "system-architect",
  engineer: "backend-dev",
  developer: "coder",
  manager: "product-manager",
  security: "security-architect",
  reporter: "analytics-reporter",
  strategist: "product-manager",
  designer: "game-designer",
  writer: "technical-writer",
  auditor: "security-auditor",
};

export type AvatarRole = { id: string; agent_type?: string | null; avatar?: string | null };

/** Ranked list of built-in avatar ids that could represent this role, best match first. */
export function avatarCandidates(role: AvatarRole | null | undefined): string[] {
  const id = (role?.id || "").toLowerCase().replace(/\s+/g, "-");
  const type = (role?.agent_type || "").toLowerCase().replace(/\s+/g, "-");
  const out: string[] = [];
  const add = (k: string | undefined) => {
    if (k && !out.includes(k)) out.push(k);
  };
  if (KNOWN_AVATARS.has(id)) add(id);
  if (KNOWN_AVATARS.has(type)) add(type);
  for (const k of KNOWN_AVATARS) {
    if (id && (id.includes(k) || k.includes(id))) add(k);
  }
  for (const [t, av] of Object.entries(TYPE_FALLBACK)) {
    if (type.includes(t) || id.includes(t)) add(av);
  }
  add("coder");
  return out;
}

/** Small stable string hash — deterministic fallback pick when every candidate is taken. */
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Assigns each role in an org a distinct built-in avatar (no two roles in the
 * same org share one), leaving any role with a custom `avatar` untouched.
 * Pure function of `roles` — cheap to recompute on every render.
 */
export function avatarMapFor(roles: AvatarRole[]): Map<string, string> {
  const used = new Set<string>();
  const map = new Map<string, string>();
  const allKnown = Array.from(KNOWN_AVATARS);
  roles.forEach((r) => {
    if (!r.id) return;
    if (r.avatar) {
      map.set(r.id, r.avatar);
      return;
    }
    const candidates = avatarCandidates(r);
    let pick = candidates.find((c) => !used.has(c));
    if (!pick) {
      const free = allKnown.filter((k) => !used.has(k));
      pick = free.length ? free[strHash(r.id) % free.length] : allKnown[strHash(r.id) % allKnown.length];
    }
    used.add(pick);
    map.set(r.id, `${AVATAR_BASE}/${pick}.svg`);
  });
  return map;
}

/** avatarMap (from avatarMapFor) keeps avatars unique within an org; without
 * it this falls back to the single best guess for this role alone. */
export function roleAvatar(role: AvatarRole | null | undefined, avatarMap?: Map<string, string>): string {
  if (avatarMap && role?.id && avatarMap.has(role.id)) return avatarMap.get(role.id) as string;
  if (role?.avatar) return role.avatar;
  return `${AVATAR_BASE}/${avatarCandidates(role)[0]}.svg`;
}
