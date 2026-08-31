import Link from "next/link";
import { ENDPOINT_GROUPS, allEndpoints } from "@/lib/docs/endpoint-registry";

const MORE_CARDS = [
  { href: "/docs/discovery", title: "Discovery", desc: "Well-known endpoints so clients can auto-configure themselves." },
  { href: "/docs/mcp", title: "MCP server", desc: "The same API as MCP tools, for agents that speak MCP." },
  { href: "/docs/errors", title: "Errors & conventions", desc: "Status codes, pagination, and the cookie-vs-token auth model." },
];

export default function DocsOverviewPage() {
  const total = allEndpoints().length;

  return (
    <div className="max-w-[70ch]">
      <div className="relative -mx-6 mb-10 overflow-hidden rounded-2xl border border-ivory-linen bg-ivory-warm px-6 py-10 sm:mx-0 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl gold-gradient"
        />
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gold-dark">Monoes API</p>
        <h1 className="mb-4 max-w-[24ch] text-4xl font-semibold tracking-tight text-espresso">Build on monoes.me</h1>
        <p className="max-w-[60ch] text-[15px] leading-relaxed text-espresso/75">
          The monoes.me community (bug reports, feature requests, org uploads, posts, and voting) is a real
          API, not just a UI. Agents, CLIs, and other websites can register an OAuth client, act on behalf of a
          signed-in user, and read or write the same data the browser does — with no password ever changing
          hands.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/docs/authentication"
          className="rounded-lg border border-ivory-linen p-4 transition-colors hover:border-gold/40 hover:bg-ivory-parchment/40"
        >
          <p className="font-medium text-espresso">Authentication</p>
          <p className="mt-1 text-sm text-espresso/60">OAuth 2.0 + PKCE, scopes, and the headless agent flow.</p>
        </Link>
        <Link
          href="/docs/quickstart"
          className="rounded-lg border border-ivory-linen p-4 transition-colors hover:border-gold/40 hover:bg-ivory-parchment/40"
        >
          <p className="font-medium text-espresso">Quickstart</p>
          <p className="mt-1 text-sm text-espresso/60">Register a client and make your first authenticated call.</p>
        </Link>
        <Link
          href="/docs/reference"
          className="rounded-lg border border-ivory-linen p-4 transition-colors hover:border-gold/40 hover:bg-ivory-parchment/40"
        >
          <p className="font-medium text-espresso">API reference</p>
          <p className="mt-1 text-sm text-espresso/60">All {total} endpoints, grouped by resource.</p>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {MORE_CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-ivory-linen p-4 transition-colors hover:border-gold/40 hover:bg-ivory-parchment/40"
          >
            <p className="font-medium text-espresso">{c.title}</p>
            <p className="mt-1 text-sm text-espresso/60">{c.desc}</p>
          </Link>
        ))}
      </div>

      <h2 id="whats-in-the-api" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        What&apos;s in the API
      </h2>
      <ul className="space-y-2 text-sm text-espresso/75">
        {ENDPOINT_GROUPS.map((g) => (
          <li key={g.slug} className="flex items-baseline gap-2">
            <Link href={`/docs/reference/${g.slug}`} className="font-medium text-gold-dark hover:underline">
              {g.name}
            </Link>
            <span className="text-espresso/50">: {g.description}</span>
          </li>
        ))}
      </ul>

      <h2 id="how-access-works" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        How access works
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Every request acts as a specific user, not an anonymous service. GET endpoints need the{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">community:read</code>{" "}
        scope; anything that creates, changes, or deletes data needs{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">community:write</code>. A
        few moderation endpoints additionally require the acting user to have the{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">admin</code> or{" "}
        <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">moderator</code> role;
        those are marked on each endpoint below. See{" "}
        <Link href="/docs/errors" className="text-gold-dark hover:underline">
          Errors &amp; conventions
        </Link>{" "}
        for the fine print on how scopes are actually checked.
      </p>

      <p className="mt-6 text-sm text-espresso/55">
        Prefer machine-readable? The full spec is at{" "}
        <a href="/api/openapi.json" className="text-gold-dark hover:underline">
          /api/openapi.json
        </a>
        , and{" "}
        <Link href="/docs/discovery" className="text-gold-dark hover:underline">
          Discovery
        </Link>{" "}
        lists every well-known endpoint a client can use to configure itself automatically.
      </p>
    </div>
  );
}
