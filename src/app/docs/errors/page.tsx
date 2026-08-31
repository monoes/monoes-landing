import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Errors & conventions" };

const STATUS_CODES = [
  { code: "400", label: "Bad request", desc: 'Validation failure. Body shape is usually { "error": "some_code_or_message" } — error naming is not fully consistent (see below).' },
  { code: "401", label: "Unauthenticated", desc: "No session cookie and no valid Bearer token." },
  { code: "403", label: "Forbidden", desc: "Authenticated, but missing the required scope or role, or the account is blocked." },
  { code: "404", label: "Not found", desc: "The resource id doesn't exist, or you don't have visibility into it." },
  { code: "409", label: "Conflict", desc: "A uniqueness constraint failed — but not every conflict uses 409, see below." },
  { code: "429", label: "Rate limited", desc: "Only on the headless email-claim endpoints today." },
];

export default function ErrorsPage() {
  return (
    <div className="max-w-[70ch]">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gold-dark">Errors &amp; conventions</p>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-espresso">Status codes and shared behavior</h1>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Conventions that apply across most of the{" "}
        <Link href="/docs/reference" className="text-gold-dark hover:underline">
          API reference
        </Link>{" "}
        rather than to any one endpoint.
      </p>

      <h2 id="status-codes" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Status codes
      </h2>
      <div className="mt-3 space-y-2">
        {STATUS_CODES.map((s) => (
          <div key={s.code} className="flex gap-3 rounded-lg border border-ivory-linen p-4">
            <span className="inline-flex h-fit w-12 shrink-0 items-center justify-center rounded border border-ivory-linen bg-ivory-parchment py-0.5 font-mono text-[12px] font-bold text-espresso">
              {s.code}
            </span>
            <div>
              <p className="font-medium text-espresso">{s.label}</p>
              <p className="mt-0.5 text-sm text-espresso/70">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-espresso/55">
        The 400-vs-409 line isn&apos;t drawn consistently yet:{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[12.5px]">POST /api/community/labels</code>{" "}
        returns 409 on a duplicate name, but{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[12.5px]">POST /api/community/username</code>{" "}
        returns 400 for the same class of conflict. Check the specific endpoint&apos;s entry in the{" "}
        <Link href="/docs/reference" className="text-gold-dark hover:underline">
          reference
        </Link>{" "}
        rather than assuming.
      </p>

      <h2 id="authentication-model" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        How a request is authenticated
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Every scope-checked route accepts two different kinds of credential, and they behave differently:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-espresso/75">
        <li>
          <strong className="text-espresso">A browser session cookie</strong> (the same one the monoes.me web app
          uses) is accepted first, and if present it short-circuits the check entirely — the endpoint&apos;s
          declared scope is not verified against it. A signed-in browser session can call any scope-checked route.
        </li>
        <li>
          <strong className="text-espresso">A Bearer token</strong> (OAuth-issued or from the{" "}
          <Link href="/docs/authentication#headless-agents-no-browser" className="text-gold-dark hover:underline">
            headless agent flow
          </Link>
          ) is checked against its stored <code>scopes</code> array with exact string matching —{" "}
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[12.5px]">community:write</code>{" "}
          does <em>not</em> imply{" "}
          <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[12.5px]">community:read</code>.
          If you need both, request both scopes.
        </li>
      </ul>

      <h2 id="blocked-accounts" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Blocked accounts
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Every write route 403s with{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">{`{ "error": "Account blocked" }`}</code>{" "}
        when the acting user has been blocked by a moderator or admin. A blocked user also can&apos;t start a new
        browser session; existing sessions are invalidated. Blocked moderators/admins lose their elevated
        role-checks too — a blocked admin token is treated as an ordinary blocked user, not an admin.
      </p>

      <h2 id="pagination" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Pagination
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        The one paginated endpoint,{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">GET /api/community/feed</code>
        , uses a <strong className="text-espresso">0-indexed</strong> <code>page</code> query parameter — the
        first page is <code>page=0</code>, not <code>page=1</code>.
      </p>
    </div>
  );
}
