import { APIError } from "better-auth/api";

// Until paid plans exist everyone is on the free plan, and there is no column
// for it. mono-agent reads this claim and does not enforce it.
export const PLAN_FREE = "free";

// Runs whenever the oauth-provider mints a JWT access token: the
// authorization-code and refresh grants that carry a `resource`. A blocked
// account is refused with invalid_grant, which is the one answer mono-agent
// reads as "monoes.me said no" (every other failure only starts its offline
// grace). The refresh grant itself never looks at the user's state, and grants
// without a `resource` (opaque tokens) never reach this function: the block
// route deleting the user's tokens, and every route's own blocked check, cover
// those. The provider also re-derives these claims when it introspects an opaque
// token, so introspecting a blocked user's token now errors; nothing here does.
export function accessTokenClaims(user: Record<string, unknown> | null | undefined): { plan: string } {
  if (user?.blockedAt) {
    throw new APIError("BAD_REQUEST", { error: "invalid_grant", error_description: "this account is blocked" });
  }
  return { plan: PLAN_FREE };
}
