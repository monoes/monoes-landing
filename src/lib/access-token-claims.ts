// Until paid plans exist everyone is on the free plan, and there is no column
// for it. mono-agent reads this claim and does not enforce it.
export const PLAN_FREE = "free";

// Runs whenever the oauth-provider mints a JWT access token: the
// authorization-code and refresh grants that carry a `resource`.
export function accessTokenClaims(): { plan: string } {
  return { plan: PLAN_FREE };
}
