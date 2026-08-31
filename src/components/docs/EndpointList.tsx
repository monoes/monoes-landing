import type { Endpoint } from "@/lib/docs/endpoint-registry";
import { MethodBadge, AuthBadge } from "./badges";

export function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div
      id={`${endpoint.method}-${endpoint.path}`}
      className="scroll-mt-24 rounded-lg border border-ivory-linen p-4 transition-colors duration-200 ease-out hover:border-gold/30 hover:bg-ivory-parchment/30"
    >
      <div className="flex flex-wrap items-center gap-2">
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-[13px] text-espresso">{endpoint.path}</code>
        <span className="ml-auto">
          <AuthBadge auth={endpoint.auth} />
        </span>
      </div>
      <p className="mt-2.5 text-sm text-espresso/80">{endpoint.summary}</p>
      {endpoint.request && (
        <div className="mt-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-espresso/45">Request</p>
          <code className="mt-1 block whitespace-pre-wrap rounded bg-ivory-parchment px-2.5 py-1.5 font-mono text-[12.5px] text-espresso/85">
            {endpoint.request}
          </code>
        </div>
      )}
      {endpoint.response && (
        <div className="mt-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-espresso/45">Response</p>
          <code className="mt-1 block whitespace-pre-wrap rounded bg-ivory-parchment px-2.5 py-1.5 font-mono text-[12.5px] text-espresso/85">
            {endpoint.response}
          </code>
        </div>
      )}
      {endpoint.notes && <p className="mt-2.5 text-[12.5px] text-espresso/55">{endpoint.notes}</p>}
    </div>
  );
}

export function EndpointList({ endpoints }: { endpoints: Endpoint[] }) {
  return (
    <div className="space-y-3">
      {endpoints.map((e) => (
        <EndpointCard key={`${e.method}-${e.path}`} endpoint={e} />
      ))}
    </div>
  );
}
