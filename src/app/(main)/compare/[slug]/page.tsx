import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPARISONS, findGuide } from "@/lib/guides";
import { GuideArticle } from "@/components/guides/GuideArticle";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return COMPARISONS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = findGuide(COMPARISONS, (await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/compare/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.description },
  };
}

export default async function Page({ params }: PageProps) {
  const guide = findGuide(COMPARISONS, (await params).slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} section={{ label: "Compare", href: "/compare" }} />;
}
