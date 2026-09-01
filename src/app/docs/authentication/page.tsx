import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = { title: "Authentication & OAuth" };

export default function AuthenticationPage() {
  return (
    <div className="max-w-[70ch]">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gold-dark">Authentication</p>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-espresso">OAuth 2.0 & agent access</h1>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        monoes.me runs a real OAuth 2.0 authorization server, separate from the cookie-based session its own
        browser client uses. This is the recommended path for agents and third-party sites. It never requires
        handling or storing a user&apos;s password.
      </p>

      <h2 id="discovery-documents" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Discovery documents
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Standard OAuth metadata, so most OAuth client libraries can configure themselves automatically.
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">
            GET /.well-known/oauth-protected-resource
          </code>{" "}
          <span className="text-espresso/60">RFC 9728 Protected Resource Metadata.</span>
        </li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">
            GET /api/auth/.well-known/oauth-authorization-server
          </code>{" "}
          <span className="text-espresso/60">
            RFC 8414 Authorization Server Metadata (issuer: <code>https://monoes.me/api/auth</code>).
          </span>
        </li>
      </ul>

      <h2 id="register-a-client" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        1. Register a client
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Dynamic Client Registration (RFC&nbsp;7591) is open: no pre-approval needed.
      </p>
      <CodeBlock
        label="curl"
        code={`curl -X POST https://monoes.me/api/auth/oauth2/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "redirect_uris": ["https://your-app.example/callback"],
    "token_endpoint_auth_method": "none",
    "grant_types": ["authorization_code", "refresh_token"]
  }'`}
      />
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Returns a <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">client_id</code>.
        Store it; you&apos;ll need it for every step below.
      </p>

      <h2 id="send-the-user-to-authorize" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        2. Send the user to authorize
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Standard authorization-code flow with PKCE. Redirect the user&apos;s browser to:
      </p>
      <CodeBlock
        label="Authorization URL"
        code={`https://monoes.me/api/auth/oauth2/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=https://your-app.example/callback
  &response_type=code
  &scope=community:read+community:write
  &code_challenge=YOUR_CODE_CHALLENGE
  &code_challenge_method=S256`}
      />
      <p className="text-[15px] leading-relaxed text-espresso/75">
        The user signs in (if needed) and approves a consent screen showing exactly the scopes you requested. Add{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">+offline_access</code> to{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">scope</code> if you want a{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">refresh_token</code> back
        from the next step — see{" "}
        <Link href="#scopes" className="text-gold-dark hover:underline">
          Scopes
        </Link>{" "}
        below.
      </p>

      <h2 id="exchange-the-code" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        3. Exchange the code for a token
      </h2>
      <CodeBlock
        label="curl"
        code={`curl -X POST https://monoes.me/api/auth/oauth2/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "code=THE_CODE_FROM_THE_REDIRECT" \\
  -d "redirect_uri=https://your-app.example/callback" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "code_verifier=YOUR_CODE_VERIFIER"`}
      />

      <h2 id="call-the-api" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        4. Call the API
      </h2>
      <CodeBlock
        label="curl"
        code={`curl https://monoes.me/api/community/feed \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
      />
      <p className="text-[15px] leading-relaxed text-espresso/75">
        The token acts as the specific user who granted consent, not an anonymous service identity. See{" "}
        <Link href="/docs/quickstart" className="text-gold-dark hover:underline">
          Quickstart
        </Link>{" "}
        for a full worked example.
      </p>

      <h2 id="scopes" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Scopes
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-espresso/75">
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">community:read</code>:
          every GET endpoint that requires auth.
        </li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">community:write</code>:
          every POST, PATCH, and DELETE endpoint.
        </li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">openid</code>,{" "}
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">profile</code>,{" "}
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">email</code>: standard
          OIDC scopes, registered on the provider but not checked by any community route.
        </li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">offline_access</code>:
          required to actually receive a <code>refresh_token</code> in the token response. Without it, the
          authorization code exchange only ever returns an <code>access_token</code> — the server silently omits
          the refresh token even if you requested the <code>refresh_token</code> grant type at registration.
        </li>
      </ul>
      <p className="mt-3 text-[13px] text-espresso/55">
        Scopes don&apos;t compose — <code>community:write</code> does not imply <code>community:read</code>, and
        requesting <code>refresh_token</code> as a grant type doesn&apos;t imply <code>offline_access</code> as a
        scope. See{" "}
        <Link href="/docs/errors#authentication-model" className="text-gold-dark hover:underline">
          Errors &amp; conventions
        </Link>{" "}
        for exactly how a token vs. a browser session is checked.
      </p>

      <h2 id="headless-agents-no-browser" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Headless agents (no browser)
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Agents that can&apos;t open a browser at all can instead relay a one-time code emailed to the account owner,
        in exchange for a scoped access token identical in shape to the OAuth-issued one.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-espresso/75">
        <li>Register a client the same way as OAuth, if you don&apos;t already have one.</li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">
            POST /api/auth/agent/claim
          </code>{" "}
          : body <code>{`{ email, client_id, scope }`}</code>. Rate limited to 3 outstanding requests per email
          per hour.
        </li>
        <li>If the email matched an account, a 6-digit code arrives by email. The user relays it to you.</li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">
            POST /api/auth/agent/claim/verify
          </code>{" "}
          : body <code>{`{ email, code, client_id }`}</code>. Returns{" "}
          <code>{`{ access_token, token_type: "Bearer", expires_in: 3600, scope }`}</code>. Codes expire after 10
          minutes and allow at most 5 attempts.
        </li>
      </ol>

      <CodeBlock
        label="curl"
        code={`# 1. Request a code
curl -X POST https://monoes.me/api/auth/agent/claim \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "user@example.com", "client_id": "YOUR_CLIENT_ID", "scope": "community:read community:write" }'
# -> 200 { "message": "If this email is registered, a verification code has been sent." }
#    (always 200 here whether or not the email is registered, to avoid leaking which emails exist)

# 2. Exchange the code the user relayed to you
curl -X POST https://monoes.me/api/auth/agent/claim/verify \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "user@example.com", "code": "123456", "client_id": "YOUR_CLIENT_ID" }'
# -> 200 { "access_token": "...", "token_type": "Bearer", "expires_in": 3600, "scope": "community:read community:write" }`}
      />
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Failure responses to plan for:
      </p>
      <ul className="mt-3 space-y-2 text-sm text-espresso/75">
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">
            400 {`{ "error": "invalid_request" }`}
          </code>{" "}
          — malformed email, missing/empty <code>client_id</code>, a scope outside the registered set, or an
          unrecognized <code>client_id</code>. (<code>/claim</code> only.)
        </li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">
            429 {`{ "error": "rate_limited" }`}
          </code>{" "}
          — 4th outstanding claim for the same email within an hour. (<code>/claim</code> only.)
        </li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">
            400 {`{ "error": "invalid_or_expired_code" }`}
          </code>{" "}
          — wrong code, expired (10 min), or the claim already hit 5 failed attempts. (<code>/claim/verify</code>{" "}
          only — same response for every failure mode, so don&apos;t branch client-side logic on the distinction.)
        </li>
      </ul>
      <p className="mt-3 text-[13px] text-espresso/55">
        The resulting token behaves identically to an OAuth-issued one everywhere else in the API — it&apos;s not a
        second-class credential.
      </p>

      <h2 id="mcp-server" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        MCP server
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        The same API is also available as{" "}
        <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline">
          MCP
        </a>{" "}
        tools, for agents that speak MCP instead of REST directly. Same bearer token, same scopes — see{" "}
        <Link href="/docs/mcp" className="text-gold-dark hover:underline">
          MCP server
        </Link>{" "}
        for the endpoint and the full tool list.
      </p>

      <h2 id="rate-limits" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Rate limits
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        No documented rate limits beyond standard platform-level protections. Accounts found abusing the API
        may be blocked, which invalidates sessions and revokes further OAuth token use.
      </p>
    </div>
  );
}
