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
  skill: https://monoes.me/.well-known/agent-skills/oauth/SKILL.md
  register_uri: https://monoes.me/api/auth/oauth2/register
  methods:
    - type: oauth2_authorization_code
      authorization_endpoint: https://monoes.me/api/auth/oauth2/authorize
      token_endpoint: https://monoes.me/api/auth/oauth2/token
      scopes: [community:read, community:write]
```

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
