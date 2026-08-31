import type { AuthRequirement, Endpoint } from "@/lib/docs/endpoint-registry";

const METHOD_STYLES: Record<Endpoint["method"], string> = {
  GET: "bg-ivory-parchment text-espresso border-ivory-linen",
  POST: "bg-gold/15 text-gold-dark border-gold/30",
  PATCH: "bg-gold-warm/15 text-gold-warm border-gold-warm/30",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

export function MethodBadge({ method }: { method: Endpoint["method"] }) {
  return (
    <span
      className={`inline-flex w-[4.5rem] shrink-0 items-center justify-center rounded border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide ${METHOD_STYLES[method]}`}
    >
      {method}
    </span>
  );
}

function authLabel(auth: AuthRequirement): string {
  if (auth.kind === "public") return "Public";
  if (auth.kind === "role") return `${auth.scope} · ${auth.roles.join("/")}`;
  return auth.scope;
}

const AUTH_STYLES: Record<AuthRequirement["kind"], string> = {
  public: "bg-ivory-parchment text-espresso/60 border-ivory-linen",
  scope: "bg-espresso/8 text-espresso/80 border-espresso/15",
  role: "bg-red-50 text-red-700 border-red-200",
};

export function AuthBadge({ auth }: { auth: AuthRequirement }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 font-mono text-[11px] ${AUTH_STYLES[auth.kind]}`}
    >
      {authLabel(auth)}
    </span>
  );
}
