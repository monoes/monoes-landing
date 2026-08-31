import type { Metadata } from "next";
import Link from "next/link";
import { ENDPOINT_GROUPS } from "@/lib/docs/endpoint-registry";
import { EndpointList } from "@/components/docs/EndpointList";

export const metadata: Metadata = { title: "API reference" };

export default function ApiReferencePage() {
  return (
    <div className="max-w-[80ch]">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gold-dark">API reference</p>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-espresso">All endpoints</h1>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Every endpoint is under <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">https://monoes.me</code>.
        Base path for all resources below: <code className="rounded bg-ivory-parchment px-1.5 py-0.5 font-mono text-[13px]">/api/community</code>{" "}
        (except the file server, which is called out). See{" "}
        <Link href="/docs/authentication" className="text-gold-dark hover:underline">Authentication</Link> for what the auth badges mean.
      </p>

      {ENDPOINT_GROUPS.map((group) => (
        <section key={group.slug} className="mt-10">
          <h2 id={group.slug} className="mb-1 text-lg font-semibold text-espresso">
            <Link href={`/docs/reference/${group.slug}`} className="hover:text-gold-dark">
              {group.name}
            </Link>
          </h2>
          <p className="mb-3 text-sm text-espresso/55">{group.description}</p>
          <EndpointList endpoints={group.endpoints} />
        </section>
      ))}
    </div>
  );
}
