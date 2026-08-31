import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = { title: "Discovery" };

type WellKnown = {
  method: "GET";
  path: string;
  rfc?: string;
  summary: string;
  why: string;
};

const WELL_KNOWN: WellKnown[] = [
  {
    method: "GET",
    path: "/.well-known/oauth-protected-resource",
    rfc: "RFC 9728",
    summary: "Protected Resource Metadata: which authorization server(s) protect this resource, and which scopes exist.",
    why: "Most OAuth/MCP client libraries fetch this first to learn where to send a user to authorize.",
  },
  {
    method: "GET",
    path: "/api/auth/.well-known/oauth-authorization-server",
    rfc: "RFC 8414",
    summary: "Authorization Server Metadata: authorize/token/register/introspect/revoke endpoints, supported grant types, PKCE method.",
    why: "Lets a client configure itself from a single URL instead of hardcoding every OAuth endpoint. Also carries a non-standard agent_auth block pointing at the headless email-claim flow.",
  },
  {
    method: "GET",
    path: "/.well-known/mcp.json",
    summary: "MCP server card (SEP-2127): name, version, and the Streamable HTTP endpoint at /api/mcp.",
    why: "MCP-aware clients use this to discover the server without a human reading docs. Mirrored at /.well-known/mcp-server-card, /.well-known/mcp/server-card.json, and /.well-known/mcp/server-cards.json for scanners that check different conventions.",
  },
  {
    method: "GET",
    path: "/.well-known/api-catalog",
    rfc: "RFC 9727",
    summary: "A linkset pointing at the OpenAPI spec (service-desc) and this docs site (service-doc).",
    why: "The generic, non-OAuth-specific way for a crawler or agent to find \"is there a machine-readable API here, and where are its docs.\"",
  },
  {
    method: "GET",
    path: "/api/openapi.json",
    summary: "The full REST API as an OpenAPI 3.0 document, generated from the same registry that powers this reference.",
    why: "Feed it to any OpenAPI-aware codegen or client tool to get typed bindings for the whole /api/community surface.",
  },
  {
    method: "GET",
    path: "/.well-known/agent-skills/index.json",
    summary: "Agent Skills discovery document listing the monoes-community skill (a SKILL.md with a content digest).",
    why: "For agent frameworks that discover capabilities via the emerging Agent Skills convention rather than OpenAPI or MCP.",
  },
];

export default function DiscoveryPage() {
  return (
    <div className="max-w-[70ch]">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gold-dark">Discovery</p>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-espresso">Auto-configuration for clients</h1>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Everything below is a static, unauthenticated GET request. A client integrating with monoes.me shouldn&apos;t
        need to hardcode every endpoint by hand — start from one of these and follow the links it returns.
      </p>

      <div className="mt-8 space-y-3">
        {WELL_KNOWN.map((w) => (
          <div key={w.path} className="rounded-lg border border-ivory-linen p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-[4.5rem] shrink-0 items-center justify-center rounded border border-ivory-linen bg-ivory-parchment px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-espresso">
                {w.method}
              </span>
              <code className="font-mono text-[13px] text-espresso">{w.path}</code>
              {w.rfc && (
                <span className="ml-auto inline-flex items-center rounded border border-espresso/15 bg-espresso/8 px-2 py-0.5 font-mono text-[11px] text-espresso/70">
                  {w.rfc}
                </span>
              )}
            </div>
            <p className="mt-2.5 text-sm text-espresso/80">{w.summary}</p>
            <p className="mt-2 text-[12.5px] text-espresso/55">{w.why}</p>
          </div>
        ))}
      </div>

      <h2 id="typical-bootstrap" className="mb-3 mt-10 text-lg font-semibold text-espresso">
        Typical bootstrap sequence
      </h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        A client that knows nothing except the hostname can fully configure itself:
      </p>
      <CodeBlock
        label="bootstrap.js"
        code={`const resource = await fetch("https://monoes.me/.well-known/oauth-protected-resource").then((r) => r.json());
const asUrl = resource.authorization_servers[0] + "/.well-known/oauth-authorization-server";
const metadata = await fetch(asUrl).then((r) => r.json());

// metadata.authorization_endpoint, metadata.token_endpoint, metadata.registration_endpoint
// are now known without hardcoding anything beyond the hostname.`}
      />

      <p className="mt-6 text-sm text-espresso/60">
        Ready to register a client? See{" "}
        <Link href="/docs/authentication" className="text-gold-dark hover:underline">
          Authentication
        </Link>{" "}
        for the full OAuth flow, or{" "}
        <Link href="/docs/mcp" className="text-gold-dark hover:underline">
          MCP server
        </Link>{" "}
        if your client speaks MCP instead of REST.
      </p>
    </div>
  );
}
