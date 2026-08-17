# Task 6 Report: Route-protection middleware

## What was implemented

- `src/middleware.ts` — `middleware(request, getSession?)` gating every `/community/*` route:
  - Public paths (`/community`, `/community/login`, `/community/register`) pass through.
  - No session → redirect to `/community/login`.
  - `blockedAt` set → redirect to `/community/login?blocked=1` and clear the `better-auth.session_token` cookie.
  - No `username` (and not already on `/community/onboarding`) → redirect to `/community/onboarding`.
  - `/community/admin*` with `role !== "admin"` → redirect to `/community`.
  - Otherwise → `NextResponse.next()`.
  - `config.matcher = ["/community/:path*"]`.
- `src/middleware.test.ts` — 4 `node:test` cases per the brief, covering: unauthenticated redirect, missing-username redirect, non-admin-on-admin-path redirect, admin-allowed-through.

This matches the brief's logic exactly. Two deliberate deviations from the brief's verbatim code were required to make the prescribed `node --experimental-strip-types --test src/middleware.test.ts` command actually run in this environment — details below.

## Node version check

`node --version` → **v22.12.0**.

## Deviations from the brief's verbatim code, and why

### 1. `mock.module` was not usable — switched to dependency injection

Per the brief's Step 2 fallback instructions, I checked `mock.module` support first. On Node 22.12.0 it throws `TypeError: mock.module is not a function` unless run with `--experimental-test-module-mocks` (confirmed by testing directly). Enabling that flag got `mock.module` itself working, but it did not solve the actual blocker (see #2) — and more importantly, even with the flag, `mock.module("@/lib/auth", ...)` still requires Node to resolve the *literal* specifier `"@/lib/auth"` as a real module for the mock's cache key. Node's ESM resolver has no knowledge of the TypeScript `paths` alias (`@/* → ./src/*`) — that mapping is only understood by TypeScript/Next.js's bundler-mode resolution, not by plain `node`. There's no existing precedent for resolving the `@/` alias under raw `node --test` in this repo (the one existing test, `src/lib/db/schema.test.ts`, deliberately uses a relative import `./schema.ts` to avoid this).

Rather than add project-wide tooling (a custom module resolution loader) just to satisfy a unit test, I used the fallback explicitly sanctioned by the brief: **dependency injection**. `middleware` now takes an optional second `getSession` parameter, defaulting to `defaultGetSession`, which does a **dynamic** `await import("@/lib/auth")` — deferred to when it's actually called. Because Next.js calls `middleware(request)` with a single argument, production behavior is unchanged (identical to the brief's original `getAuth().api.getSession(...)` call), and Next's own bundler resolves `@/lib/auth` normally. In tests, the mock function is passed explicitly as the second argument, so `defaultGetSession`'s dynamic import of `@/lib/auth` (and therefore the D1/Drizzle/better-auth dependency chain) is never evaluated at all — no module mocking needed, and no test-only resolver/loader hack required.

This required rewriting `src/middleware.test.ts` from the brief's `mock.module`-based version to a DI-based version, while **preserving the exact 4 test cases, their scenarios, and their assertions** verbatim (same `assert.equal`/`assert.match` calls, same status/location checks).

### 2. `next/server` bare specifier — switched to `next/server.js`

Independent of the mock.module issue, plain `node` cannot resolve the bare specifier `"next/server"` (used by both the test and, transitively, `middleware.ts` itself) because the installed `next@16.2.10` package has no `"exports"` map, and Node's strict ESM resolver requires either an exact file match or an explicit extension for subpath imports of a package without one — Node's own error message says exactly this: `Cannot find module '.../node_modules/next/server' ... Did you mean to import "next/server.js"?`. This is purely a Node-vs-bundler resolution difference; `next/server.js` is the literal, unambiguous file backing the `next/server` public entry point (confirmed by reading `node_modules/next/server.js`, which just re-exports `NextRequest`/`NextResponse`/etc.), so this is a zero-behavior-change substitution. I applied it in both `src/middleware.ts` and `src/middleware.test.ts` for consistency — Next.js's own bundler resolves `next/server.js` identically to `next/server`, so this has no effect on production behavior under `next dev`/`next build`.

I considered leaving `middleware.ts` on the idiomatic `"next/server"` and only changing the test file, but since the test imports `middleware.ts` directly (not mocked), `middleware.ts`'s own import has to resolve under plain `node` too — so the change had to be made in both files to get a working, no-loader-hack test command.

## Commands run and output

```
node --experimental-strip-types --test src/middleware.test.ts
```
Before `src/middleware.ts` existed: **FAIL** — `Cannot find module './middleware'` (as expected, Step 2).

After implementation (final): **PASS**, 4/4 tests:
```
# tests 4
# suites 1
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Also ran, as extra verification (not requested by the brief but useful given the deviations):
- `npx tsc --noEmit -p tsconfig.json` — clean except one pre-existing class of error (`TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled`) on the `./middleware.ts` relative import in the test file. This is **not new** — the exact same error already exists on the pre-existing `src/lib/db/schema.test.ts` (`./schema.ts`) from Task 2, which was already committed and reviewed, so it's an accepted characteristic of how this project's `node:test` files import their subject module (explicit `.ts` extension, required for plain-`node` resolution, at the cost of this one tsc diagnostic). I did not attempt to fix this pre-existing pattern since it's outside this task's scope and consistent with prior precedent.
- `npx eslint src/middleware.ts src/middleware.test.ts` — clean, no output.

## Files changed

- `src/middleware.ts` (new)
- `src/middleware.test.ts` (new)

## Self-review findings

- Logic matches the brief's Step 3 code 1:1 apart from the `GetSession` DI parameter and the `next/server.js` specifier — same public-path set, same redirect targets/order (blocked → onboarding → admin-role check), same cookie name, same matcher.
- `GetSession` type is exported from `middleware.ts` so the test can type `mock.fn<GetSession>(...)` precisely instead of using `any`.
- `defaultGetSession` casts the better-auth session shape via `as unknown as { user: SessionUser }`, mirroring the brief's own `session.user as unknown as SessionUser` cast inside `middleware` (better-auth's inferred `user.username` type is `string | null | undefined`, not `string | null`, and includes an extra `session` field) — this cast was already necessary in the brief's own code and I extended the same pattern one level out.
- No other files were touched; `.claude/settings.json` and `tsconfig.tsbuildinfo` showed as modified in git status before I started this task and were left untouched (not part of this change).
- Confirmed via `git status` that only `src/middleware.ts` and `src/middleware.test.ts` were staged and committed.

## Commit

- `a19d64c` — `feat: add community route-protection middleware`

## Fix: spec review follow-up

Spec review rejected changing `src/middleware.ts`'s import from `"next/server"` to `"next/server.js"`, since that's production code and the brief never authorized touching its import specifier — only the test's isolation mechanism was authorized to adapt. Required fix: revert `middleware.ts` to `import { NextRequest, NextResponse } from "next/server";` (exactly as the brief specifies) and solve the bare-specifier resolution problem only inside the test file. The DI signature (`middleware(request, getSession = defaultGetSession)`) and the dynamic `import("@/lib/auth")` inside `defaultGetSession` were explicitly approved and left unchanged.

**What changed:**
- `src/middleware.ts`: reverted the import back to `import { NextRequest, NextResponse } from "next/server";` — no other changes.
- `src/middleware.test.ts`: replaced the static `import { NextRequest } from "next/server.js"` with a test-scoped runtime resolve hook, registered via `node:module`'s `register()` before dynamically importing `next/server` and `./middleware.ts`:

  ```ts
  import { register } from "node:module";
  import type { GetSession } from "./middleware.ts";

  register(
    "data:text/javascript,export function resolve(specifier, context, next) { if (specifier === 'next/server') { return next('next/server.js', context); } return next(specifier, context); }",
    import.meta.url,
  );

  const { NextRequest } = await import("next/server");
  const { middleware } = await import("./middleware.ts");
  ```

  The hook only ever rewrites the single literal specifier `"next/server"` → `"next/server.js"` (the real file Node itself named in its `ERR_MODULE_NOT_FOUND` suggestion), and only for module resolutions that happen inside this test process — it has zero effect on `next dev`/`next build`, which use Next's own bundler resolution and never load this hook. The `GetSession` type import stays a static `import type`, which TypeScript/Node's type-stripping erase entirely at compile time (no runtime resolution attempted), so it doesn't need to go through the hook.

**Test command + output (unchanged from the brief, no extra CLI flags needed since the hook is registered from inside the test file):**

```
node --experimental-strip-types --test src/middleware.test.ts
```

Result: **PASS**, 4/4 tests —
```
# tests 4
# suites 1
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Also re-ran `npx tsc --noEmit -p tsconfig.json` (clean except the same pre-existing `TS5097` precedent noted above, now on the `import type { GetSession } from "./middleware.ts"` line instead) and `npx eslint src/middleware.ts src/middleware.test.ts` (clean, no output).

**Commit:** `1c7f6e1` — `fix: keep middleware.ts on next/server, isolate test via module.register hook` (see below for actual SHA).
