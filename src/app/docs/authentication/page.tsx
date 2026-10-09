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
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">library:read</code>: your private
          library items (<code>scope=mine</code> listings and private items) and every download, official items
          included. Browsing public and official items needs no token.
        </li>
        <li>
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">library:write</code>: publishing,
          versioning, editing and deleting library items.
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

      <h2 id="monoagent" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Desktop apps: the MonoAgent client
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        MonoAgent (desktop app and <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">monoagentcli</code>) signs
        in with a fixed public client, <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">client_id=monoagent</code>, instead of registering one. It uses the
        native-app pattern from RFC&nbsp;8252: authorization code + PKCE (S256, required, no client secret), with the
        redirect going to a one-off listener on the loopback interface.
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-espresso/75">
        <li>
          Redirect URI: <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">http://127.0.0.1:&lt;any port&gt;/callback</code>{" "}
          (or <code>[::1]</code>). The port can change on every login (RFC&nbsp;8252 §7.3); the host must be the
          literal IP, not <code>localhost</code>, and the path must be <code>/callback</code>.
        </li>
        <li>
          Scopes: <code>openid profile email offline_access library:read library:write</code>.{" "}
          <code>offline_access</code> returns a refresh token; refresh with{" "}
          <code>grant_type=refresh_token&amp;client_id=monoagent</code>.
        </li>
        <li>
          After login, <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">GET /api/library/me</code> returns the
          account and granted scopes. Machines without a browser can use the{" "}
          <Link href="#headless-agents-no-browser" className="text-gold-dark hover:underline">
            email-code flow
          </Link>{" "}
          with <code>client_id=monoagent</code>.
        </li>
      </ul>
      <CodeBlock
        label="Authorization URL (MonoAgent)"
        code={`https://monoes.me/api/auth/oauth2/authorize
  ?client_id=monoagent
  &redirect_uri=http://127.0.0.1:53682/callback
  &response_type=code
  &scope=openid+profile+email+offline_access+library:read+library:write
  &code_challenge=YOUR_CODE_CHALLENGE
  &code_challenge_method=S256
  &state=RANDOM_STATE`}
      />
      <CodeBlock
        label="curl"
        code={`curl -X POST https://monoes.me/api/auth/oauth2/token \\
  -d "grant_type=authorization_code" \\
  -d "code=THE_CODE_FROM_THE_CALLBACK" \\
  -d "redirect_uri=http://127.0.0.1:53682/callback" \\
  -d "client_id=monoagent" \\
  -d "code_verifier=YOUR_CODE_VERIFIER"
# -> { "access_token": "...", "refresh_token": "...", "token_type": "Bearer", "scope": "..." }`}
      />
      <p className="text-[15px] leading-relaxed text-espresso/75">
        The library endpoints are listed under{" "}
        <Link href="/docs/reference/library" className="text-gold-dark hover:underline">
          API reference → Library
        </Link>
        .
      </p>

      <h2 id="monoagent-tokens" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        MonoAgent tokens: audience and claims
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Send <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">resource=https://monoes.me/api/monoagent</code>{" "}
        (RFC&nbsp;8707) on the authorization request, the token request and every refresh, and the access token is a signed
        JWT bound to that audience instead of an opaque string. Send no <code>resource</code> and nothing changes: the token
        is opaque, as it always was. Only the <code>monoagent</code> client may ask for this resource; any other client is
        answered <code>invalid_target</code>. A refresh token that was issued without a <code>resource</code> can be
        exchanged with one.
      </p>
      <CodeBlock
        label="curl"
        code={`curl -X POST https://monoes.me/api/auth/oauth2/token \\
  -d "grant_type=refresh_token" \\
  -d "client_id=monoagent" \\
  -d "refresh_token=YOUR_REFRESH_TOKEN" \\
  -d "resource=https://monoes.me/api/monoagent"
# -> { "access_token": "eyJ...", "refresh_token": "...", "expires_in": 3600, ... }`}
      />
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-espresso/75">
        <li>
          Header: <code>alg</code> is <code>EdDSA</code> (Ed25519), <code>typ</code> is <code>at+jwt</code>, and{" "}
          <code>kid</code> names a key published at{" "}
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">GET /api/auth/jwks</code>.
          The signing key is a fixed key that monoes.me supplies; it is not generated or rotated automatically, so a client
          can pin its public key. During a planned rotation the previous public key stays published for a while, so tokens
          issued just before the change keep verifying.
        </li>
        <li>
          <code>iss</code> is <code>https://monoes.me/api/auth</code>. <code>aud</code> is an array that contains{" "}
          <code>https://monoes.me/api/monoagent</code>, next to the userinfo endpoint when <code>openid</code> is requested.
        </li>
        <li>
          <code>azp</code> and <code>client_id</code> are <code>monoagent</code>. <code>sub</code> is the user id.{" "}
          <code>scope</code> holds the granted scopes, space-separated.
        </li>
        <li>
          <code>iat</code> and <code>exp</code> are one hour apart (<code>exp - iat</code> is 3600). <code>jti</code> is
          unique per token.
        </li>
        <li>
          <code>plan</code> is <code>free</code> for every account today. <code>sid</code>, when present, names the web
          session the sign-in went through, and is <code>null</code> once that session has ended: do not rely on it.
        </li>
      </ul>
      <p className="mt-3 text-[15px] leading-relaxed text-espresso/75">
        Refresh tokens rotate: each refresh returns a new one and the old one stops working. Retrying a refresh whose
        answer was lost, within five minutes, returns that same answer again; presenting a used refresh token after that
        revokes the refresh tokens of that sign-in, so sign in again on that machine. The other sign-ins of the account
        keep working. Revoking a refresh token at <code>/api/auth/oauth2/revoke</code> ends its sign-in the same way. A
        refresh that is answered <code>invalid_grant</code> means the sign-in cannot continue: its tokens were revoked,
        they expired after 30 days, or the account is blocked. Every other failure (<code>invalid_target</code>, a 5xx,
        no network) says nothing about the account. Blocking an account deletes its refresh tokens, opaque access tokens
        and web sessions in one step, and a blocked account is never issued a new token. A JWT that was already issued is
        a signed statement and is not looked up again: ending a sign-in does not cancel it, it stays valid until its{" "}
        <code>exp</code> (within the hour), except that the library and community API answer a blocked account{" "}
        <code>403</code> with the code <code>blocked</code> in the meantime.
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
          <code>{`{ access_token, token_type: "Bearer", expires_in: 3600, scope }`}</code>. For the{" "}
          <code>monoagent</code> client and a claim whose scope includes <code>offline_access</code> the answer also carries
          a <code>refresh_token</code>, which can be exchanged at the token endpoint with the <code>resource</code> above.
          Adding that <code>resource</code> to the body gets the token endpoint&apos;s answer at once: an audience-bound
          JWT and a <code>refresh_token</code>. Codes expire after 10 minutes and allow at most 5 attempts.
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
