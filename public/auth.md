# auth.md

## Audience

This document is for automated agents and developer tools that want to interact with the monoes.me community programmatically (feature requests, bug reports, org uploads, posts, voting). It is not relevant to the marketing site itself, which requires no authentication.

## No OAuth support

monoes.me does not implement OAuth 2.0. There is no `/.well-known/oauth-protected-resource` or `/.well-known/oauth-authorization-server` document, no client registration, and no scopes — publishing those would misrepresent endpoints that don't actually speak the OAuth protocol. Authentication is plain email/password with a session cookie, provided by [Better Auth](https://www.better-auth.com/).

## Registration and sign-in endpoints

- `POST /api/auth/sign-up/email` — create an account. Body: `{ "email": string, "password": string, "name": string }`. Password minimum length: 8 characters. Email verification is not required.
- `POST /api/auth/sign-in/email` — sign in. Body: `{ "email": string, "password": string }`.

Both endpoints are part of Better Auth's standard API surface, mounted at `/api/auth/*`.

## Credential use

A successful sign-up or sign-in sets a `better-auth.session_token` cookie (`__Secure-better-auth.session_token` in production). Every subsequent request to `/api/community/*` (see `/api/openapi.json` and `/community/api-docs` for the endpoint list) must include that cookie to be treated as authenticated. There is no API key or bearer token scheme — this is cookie-based session auth, the same mechanism the site's own browser client uses.

New accounts have no `username` set and must complete onboarding (`POST /api/community/username`) before most write endpoints will accept requests from them.

## Rate limits and abuse

No documented rate limits beyond standard platform-level protections. Accounts found abusing the API may be blocked (`blockedAt` set on the user record), which invalidates the session and blocks further requests.
