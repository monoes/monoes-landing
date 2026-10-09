// What a MonoAgent access token looks like. mono-agent verifies the same values
// offline (internal/account/claims.go in github.com/monoes/mono-agent).

// The audience (RFC 8707 `resource`) MonoAgent tokens are bound to: an
// identifier, not an endpoint. drizzle/0017_monoagent_audience.sql registers it.
export const MONOAGENT_AUDIENCE = "https://monoes.me/api/monoagent";

// The one public OAuth client allowed to ask for that audience.
export const MONOAGENT_CLIENT_ID = "monoagent";

// The `iss` of every token: Better-Auth's base URL plus its base path.
export function authIssuer(): string {
  return `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/auth`;
}
