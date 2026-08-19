// Ported from monomind/packages/@monomind/cli/src/orgrt/types.ts (lines 18-207)
// as of this file's creation. This is monomind's own Zod validation schema
// for org config files, copied here (not imported as a package dependency)
// so this project can validate uploaded org JSON without depending on
// monomind's internal package layout. If monomind's schema changes, this
// copy will drift — that's an accepted tradeoff for a feature that's
// fundamentally a viewer, not a live integration (see the design spec's
// "Out of scope" section).
import { z } from "zod";

export const FailureRoutingSchema = z
  .object({
    retry: z
      .object({
        maxAttempts: z.number().int().positive(),
        backoffMs: z.array(z.number().int().nonnegative()).optional(),
      })
      .partial()
      .optional(),
    fallbackAssignee: z.string().optional(),
    escalate: z.boolean().optional(),
  })
  .partial();

export const ProviderSchema = z
  .object({
    kind: z
      .enum([
        "subscription",
        "api-key",
        "base-url",
        "bedrock",
        "vertex",
        "gemini",
        "openai",
        "vercel-api-key",
        "codex",
        "antigravity",
      ])
      .default("subscription"),
    vendor: z
      .enum([
        "openai",
        "anthropic",
        "google",
        "xai",
        "deepseek",
        "glm",
        "mistral",
        "groq",
        "together",
        "fireworks",
        "cohere",
        "perplexity",
        "alibaba",
        "openrouter",
        "ollama",
        "openai-compatible",
      ])
      .optional(),
    apiKeyEnv: z.string().optional(),
    baseUrl: z.string().optional(),
    authTokenEnv: z.string().optional(),
    usageProxy: z.boolean().optional(),
    usageProxyEnvVar: z.string().optional(),
  })
  .strict();

const THREAT_TYPES = [
  "prompt_injection",
  "jailbreak",
  "pii_exposure",
  "instruction_override",
  "role_switching",
  "context_manipulation",
  "encoding_attack",
  "data_exfiltration",
  "unknown",
] as const;

export const FenceAllowlistRuleSchema = z.object({
  id: z.string().min(1),
  pattern: z.string().min(1),
  types: z.array(z.enum(THREAT_TYPES)).default([]),
  context: z.string().optional(),
  reason: z.string().optional(),
  source: z.string().optional(),
});

export const FenceConfigSchema = z
  .object({
    enabled: z.boolean().default(true),
    confidenceThreshold: z.number().min(0).max(1).optional(),
    enablePIIDetection: z.boolean().optional(),
    scanMessages: z.boolean().default(true),
    scanOutput: z.boolean().default(false),
    abortThreshold: z.number().min(0).max(1).default(0.8),
    allowlist: z.array(FenceAllowlistRuleSchema).default([]),
  })
  .partial()
  .passthrough();

export const RolePolicySchema = z
  .object({
    allowTools: z.array(z.string()).optional(),
    denyTools: z.array(z.string()).default([]),
    fileWrite: z.array(z.string()).default(["**"]),
    fileRead: z.array(z.string()).default(["**"]),
    webAllow: z.array(z.string()).optional(),
    maxTokens: z.number().int().positive().optional(),
    maxUsd: z.number().positive().optional(),
    git: z.enum(["none", "read", "commit", "push"]).default("read"),
    fence: FenceConfigSchema.optional(),
    autoApproveTools: z.array(z.string()).optional(),
  })
  .partial()
  .passthrough();

export const RoleSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().default(""),
    type: z.string().default("specialist"),
    reports_to: z.string().nullable().default(null),
    responsibilities: z.array(z.string()).default([]),
    instructions_file: z.string().optional(),
    adapter_config: z
      .object({
        model: z.string().default("claude-sonnet-4-5"),
        max_tokens: z.number().optional(),
      })
      .partial()
      .optional(),
    provider: ProviderSchema.optional(),
    policy: RolePolicySchema.optional(),
    runtime: z
      .enum([
        "claude",
        "kimicode",
        "opencode",
        "vercel",
        "codex",
        "antigravity",
        "grok",
        "qwen",
        "crush",
        "copilot",
        "pi",
        "pi-rpc",
        "qwen-rpc",
      ])
      .optional(),
    max_turns_per_message: z.number().int().positive().optional(),
    budget_tokens: z.number().int().positive().optional(),
    budget_usd: z.number().positive().optional(),
  })
  .passthrough();

export const DEFAULT_MAX_TURNS_PER_MESSAGE = 100_000;

export const OrgDefSchema = z
  .object({
    name: z.string().min(1),
    goal: z.string().default(""),
    status: z.string().default("stopped"),
    schedule: z.union([z.string(), z.number(), z.null()]).default(null),
    run_config: z
      .object({
        max_concurrent_agents: z.number().int().positive().default(4),
        budget_tokens: z.number().int().positive().default(1_000_000),
        memory_namespace: z.string().optional(),
        max_turns_per_message: z.number().int().positive().default(DEFAULT_MAX_TURNS_PER_MESSAGE),
        idle_minutes: z.number().nonnegative().optional(),
        workspace: z
          .union([
            z.literal("repo"),
            z.literal("isolated"),
            z.literal("worktree"),
            z.literal("worktree-per-role"),
            z.string(),
          ])
          .optional(),
        circuit_breaker: z
          .object({
            failure_threshold: z.number().int().positive().default(5),
            cooldown_ms: z.number().int().nonnegative().default(0),
          })
          .partial()
          .optional(),
        failure_routing: FailureRoutingSchema.optional(),
        stale_base_threshold: z.number().int().nonnegative().default(0),
        prechecks: z
          .array(
            z.object({
              name: z.string(),
              command: z.string(),
            }),
          )
          .optional(),
      })
      .partial()
      .passthrough()
      .default({})
      .transform((rc) => ({
        max_concurrent_agents: 4,
        budget_tokens: 1_000_000,
        max_turns_per_message: DEFAULT_MAX_TURNS_PER_MESSAGE,
        workspace: "repo" as string,
        stale_base_threshold: 0,
        ...rc,
      })),
    fence: FenceConfigSchema.optional(),
    roles: z.array(RoleSchema).min(1),
    runtime: z
      .enum([
        "claude",
        "kimicode",
        "opencode",
        "vercel",
        "codex",
        "antigravity",
        "grok",
        "qwen",
        "crush",
        "copilot",
        "pi",
        "pi-rpc",
        "qwen-rpc",
      ])
      .optional(),
  })
  .passthrough();

export type OrgDef = z.infer<typeof OrgDefSchema>;
export type OrgRole = z.infer<typeof RoleSchema>;
