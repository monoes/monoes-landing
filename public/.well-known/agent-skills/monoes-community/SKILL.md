---
name: monoes-community
description: Interact with the monoes.me community API and MCP server — register an OAuth client, authenticate as a user (via OAuth authorization-code flow or a headless verified-email code), and read/write feature requests, bug reports, forum posts, and org uploads.
---

# monoes.me community

This skill covers how to act on behalf of a monoes.me user: read the community feed, submit feature requests and bug reports, comment, vote, post to the forum, and upload/run monomind orgs.

Full reference: fetch `https://monoes.me/auth.md` for the complete discovery documents, error handling, and rate limits. This skill is the condensed, task-oriented version.

## 1. Get a client_id

Register once per agent (no pre-approval needed):

```
POST https://monoes.me/api/auth/oauth2/register
Content-Type: application/json

{
  "redirect_uris": ["https://your-agent.example/callback"],
  "token_endpoint_auth_method": "none",
  "grant_types": ["authorization_code", "refresh_token"]
}
```

Save the returned `client_id`.

## 2. Get an access token

**If you can open a browser** (the user can complete a redirect): use the OAuth authorization-code + PKCE flow. Redirect to `GET https://monoes.me/api/auth/oauth2/authorize` with `client_id`, `redirect_uri`, `response_type=code`, `scope=community:read community:write`, `code_challenge`, `code_challenge_method=S256`. The user signs in and approves a consent screen. Exchange the returned `code` at `POST https://monoes.me/api/auth/oauth2/token`.

**If you cannot open a browser** (headless agent): use the verified-email flow instead.

```
POST https://monoes.me/api/auth/agent/claim
Content-Type: application/json

{ "email": "<the user's account email>", "client_id": "<your client_id>", "scope": "community:read community:write" }
```

The user receives a 6-digit code by email and relays it to you. Then:

```
POST https://monoes.me/api/auth/agent/claim/verify
Content-Type: application/json

{ "email": "<same email>", "code": "<the 6-digit code>", "client_id": "<your client_id>" }
```

Both paths return `{ "access_token": "...", "token_type": "Bearer", "expires_in": 3600 }`.

## 3. Call the API

Two equivalent ways to act — pick whichever fits your setup, both authenticate identically with `Authorization: Bearer <access_token>`:

**REST**: `GET/POST https://monoes.me/api/community/*` — see `https://monoes.me/community/api-docs` or `https://monoes.me/api/openapi.json` for the full endpoint list (feed, features, bugs, posts, orgs, voting, comments).

**MCP**: `POST https://monoes.me/api/mcp` (Streamable HTTP, stateless — no session setup needed). `tools/list` (no auth required) returns 11 tools: `get_feed`, `create_feature`, `vote_feature`, `create_bug`, `vote_bug`, `comment_bug`, `create_org`, `vote_org`, `run_org`, `create_post`, `vote_post`. Each `tools/call` needs the same `Authorization: Bearer <access_token>` header.

## Notes

- A brand-new account has no `username` set — most write actions fail until the user completes onboarding (`POST /api/community/username`) on the site itself.
- An account can be blocked (`blockedAt` set), which invalidates its tokens.
- Errors from voting/creating endpoints return `{ "error": "<message>" }` with the appropriate 4xx status — surface these to the user rather than retrying blindly.
