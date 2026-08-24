# auth.md

## Audience

This document is for automated agents and developer tools that want to interact with the monoes.me community programmatically (feature requests, bug reports, org uploads, posts, voting). It is not relevant to the marketing site itself, which requires no authentication.

## OAuth 2.0 support

monoes.me implements a real OAuth 2.0 authorization server for agent access, in addition to the cookie-based session auth its own browser client uses. Discovery documents:

- `GET /.well-known/oauth-protected-resource` — RFC 9728 Protected Resource Metadata for `https://monoes.me/api/community`.
- `GET /api/auth/.well-known/oauth-authorization-server` — RFC 8414 Authorization Server Metadata (issuer: `https://monoes.me/api/auth`).

Dynamic Client Registration (RFC 7591) is open — no pre-approval needed:

```
POST /api/auth/oauth2/register
{ "redirect_uris": ["https://your-agent.example/callback"],
  "token_endpoint_auth_method": "none",
  "grant_types": ["authorization_code", "refresh_token"] }
```

Returns a `client_id`. From there it's the standard authorization-code flow with PKCE:

1. Redirect the user to `GET /api/auth/oauth2/authorize` with `client_id`, `redirect_uri`, `response_type=code`, `scope`, `code_challenge`, `code_challenge_method=S256`. The user signs in (if needed) and approves a consent screen showing the requested scopes.
2. Exchange the returned `code` at `POST /api/auth/oauth2/token` (`grant_type=authorization_code`, plus `code_verifier`) for an access token.
3. Call `/api/community/*` endpoints with `Authorization: Bearer <access_token>`.

Scopes: `community:read` (GET endpoints), `community:write` (POST/PATCH/DELETE endpoints). Access tokens act as the specific user who granted consent — not an anonymous service identity.

```yaml
agent_auth:
  skill: https://monoes.me/auth.md
  register_uri: https://monoes.me/api/auth/oauth2/register
  methods:
    - type: oauth2_authorization_code
      authorization_endpoint: https://monoes.me/api/auth/oauth2/authorize
      token_endpoint: https://monoes.me/api/auth/oauth2/token
      scopes: [community:read, community:write]
```

## Verified-email identity assertion (headless agents)

For agents that cannot open a browser at all, monoes.me also supports a headless flow: relay a one-time code emailed to the account owner, in exchange for a scoped access token identical in shape to the one the OAuth flow issues.

1. Register a `client_id` the same way as OAuth (`POST /api/auth/oauth2/register`), if you don't already have one.
2. `POST /api/auth/agent/claim` — body `{ "email": string, "client_id": string, "scope": string }` (space-separated scopes, e.g. `"community:read community:write"`). Always returns `200 { "message": "If this email is registered, a verification code has been sent." }`, whether or not the email matched an account — this avoids leaking which emails have accounts. Rate limited to 3 outstanding requests per email per hour.
3. If the email matched a real account, a 6-digit code arrives by email. The user relays it to the agent out-of-band (e.g. pastes it into their chat with the agent).
4. `POST /api/auth/agent/claim/verify` — body `{ "email": string, "code": string, "client_id": string }`. On success: `200 { "access_token": string, "token_type": "Bearer", "expires_in": 3600, "scope": string }`. Codes expire after 10 minutes and allow at most 5 attempts; any failure (wrong code, expired, exhausted attempts, unknown email) returns the same `400 { "error": "invalid_or_expired_code" }` — no information about which case occurred.
5. Call `/api/community/*` endpoints with `Authorization: Bearer <access_token>`, exactly as with the OAuth-issued token.

```yaml
agent_auth:
  identity_endpoint: https://monoes.me/api/auth/agent/claim
  claim_endpoint: https://monoes.me/api/auth/agent/claim/verify
  identity_types_supported: [identity_assertion]
  identity_assertion:
    assertion_types_supported: [verified_email]
    credential_types_supported: [access_token]
    claim_uri: https://monoes.me/api/auth/agent/claim/verify
```

## MCP server

The same community API is also available as [MCP](https://modelcontextprotocol.io) tools, for agents that speak MCP instead of REST directly.

- Server card: `GET /.well-known/mcp.json` (also served at `/.well-known/mcp/server-card.json`, `/.well-known/mcp/server-cards.json`, and `/.well-known/mcp-server-card`).
- Endpoint: `POST /api/mcp` — Streamable HTTP transport, stateless (no session ID, no persistent connection state — each request is self-contained).
- `initialize` and `tools/list` require no authentication. Each `tools/call` is authenticated exactly like the REST API: pass `Authorization: Bearer <access_token>` (from either the OAuth or verified-email flow above) on the MCP HTTP request, and it's forwarded to the same underlying route handler the REST API uses — auth failures surface as a normal tool result with `isError: true`, not a transport-level error.
- Tools: `get_feed` (no auth required), `create_feature`, `vote_feature`, `create_bug`, `vote_bug`, `comment_bug`, `create_org`, `vote_org`, `run_org`, `create_post`, `vote_post` — one per `/api/community/*` write action documented below, plus the feed.

## Cookie-based session auth (browser client)

The site's own frontend uses plain email/password with a session cookie, provided by [Better Auth](https://www.better-auth.com/):

- `POST /api/auth/sign-up/email` — create an account. Body: `{ "email": string, "password": string, "name": string }`. Password minimum length: 8 characters. Email verification is not required.
- `POST /api/auth/sign-in/email` — sign in. Body: `{ "email": string, "password": string }`.

A successful sign-up or sign-in sets a `better-auth.session_token` cookie (`__Secure-better-auth.session_token` in production). This is not the recommended path for agents — use OAuth above instead, since it doesn't require handling or storing a password.

New accounts (via either auth method) have no `username` set and must complete onboarding (`POST /api/community/username`) before most write endpoints will accept requests from them.

## API reference

See `/api/openapi.json` and `/community/api-docs` for the full `/api/community/*` endpoint list.

## Rate limits and abuse

No documented rate limits beyond standard platform-level protections. Accounts found abusing the API may be blocked (`blockedAt` set on the user record), which invalidates sessions and revokes further OAuth token use.
