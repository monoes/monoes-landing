import { OAUTH_SCOPES } from "@/lib/auth";

function baseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

function issuerUrl(): string {
  return `${baseUrl()}/api/auth`;
}

// The oauth-provider plugin only serves RFC 8414 Authorization Server
// Metadata under its own base path
// (/api/auth/.well-known/oauth-authorization-server — confirmed against a
// real response, see
// docs/mastermind/specs/2026-08-23-oauth-authorization-server-design.md).
// Discovery tools look for it at the site root instead, and per RFC 8414
// §3.1's path-insertion convention (issuer with a path component ->
// metadata at /.well-known/oauth-authorization-server<issuer-path>) also
// check /.well-known/oauth-authorization-server/api/auth specifically.
// This optional-catch-all route answers both forms — and any other
// trailing path — identically, since there's only one issuer.
export function GET() {
  const issuer = issuerUrl();
  return Response.json({
    scopes_supported: [...OAUTH_SCOPES],
    issuer,
    authorization_endpoint: `${issuer}/oauth2/authorize`,
    token_endpoint: `${issuer}/oauth2/token`,
    jwks_uri: `${issuer}/jwks`,
    registration_endpoint: `${issuer}/oauth2/register`,
    introspection_endpoint: `${issuer}/oauth2/introspect`,
    revocation_endpoint: `${issuer}/oauth2/revoke`,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "client_credentials", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_basic", "client_secret_post", "private_key_jwt"],
    code_challenge_methods_supported: ["S256"],
    authorization_response_iss_parameter_supported: true,
    // Non-standard extension (not part of RFC 8414) that agent-readiness
    // scanners (e.g. isitagentready.com, per its auth.md skill) look for
    // directly on the Authorization Server Metadata response, pointing
    // agents at registration and documenting the one flow this server
    // supports. Mirrors the same block published in /auth.md.
    agent_auth: {
      skill: "/auth.md",
      register_uri: `${issuer}/oauth2/register`,
      methods: [
        {
          type: "oauth2_authorization_code",
          authorization_endpoint: `${issuer}/oauth2/authorize`,
          token_endpoint: `${issuer}/oauth2/token`,
          scopes: [...OAUTH_SCOPES],
        },
      ],
      // Headless identity-assertion flow for agents that cannot open a
      // browser at all: relay a one-time code emailed to the account
      // owner. See docs/mastermind/specs/2026-08-23-verified-email-claim-design.md.
      identity_endpoint: `${baseUrl()}/api/auth/agent/claim`,
      claim_endpoint: `${baseUrl()}/api/auth/agent/claim/verify`,
      identity_types_supported: ["identity_assertion"],
      identity_assertion: {
        assertion_types_supported: ["verified_email"],
        credential_types_supported: ["access_token"],
        claim_uri: `${baseUrl()}/api/auth/agent/claim/verify`,
      },
    },
  });
}
