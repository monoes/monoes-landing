import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ENDPOINT_GROUPS } from "@/lib/docs/endpoint-registry";
import { EndpointList } from "@/components/docs/EndpointList";

export function generateStaticParams() {
  return ENDPOINT_GROUPS.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await params;
  const found = ENDPOINT_GROUPS.find((g) => g.slug === group);
  return { title: found?.name ?? "API reference" };
}

export default async function ApiGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const found = ENDPOINT_GROUPS.find((g) => g.slug === group);
  if (!found) notFound();

  return (
    <div className="max-w-[80ch]">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gold-dark">
        <Link href="/docs/reference" className="hover:underline">API reference</Link>
      </p>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-espresso">{found.name}</h1>
      <p className="mb-6 text-[15px] leading-relaxed text-espresso/75">{found.description}</p>
      <EndpointList endpoints={found.endpoints} />
    </div>
  );
}
