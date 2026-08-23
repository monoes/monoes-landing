import { OAUTH_SCOPES } from "@/lib/auth";

function baseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

// The oauth-provider plugin's issuer is its own base path, `/api/auth`
// (confirmed against a real /.well-known/oauth-authorization-server
// response — see docs/mastermind/specs/2026-08-23-oauth-authorization-server-design.md),
// not the bare origin.
function issuerUrl(): string {
  return `${baseUrl()}/api/auth`;
}

export function GET() {
  return Response.json(
    {
      // Scoped to the site origin, not the /api/community path prefix —
      // agent-readiness scanners validate this field against the scanned
      // URL itself (the origin), and monoes.me's OAuth-protected surface
      // (currently /api/community/*) is the site's only such API today.
      resource: baseUrl(),
      authorization_servers: [issuerUrl()],
      scopes_supported: [...OAUTH_SCOPES],
      bearer_methods_supported: ["header"],
    },
    { headers: { "Content-Type": "application/json" } },
  );
}
