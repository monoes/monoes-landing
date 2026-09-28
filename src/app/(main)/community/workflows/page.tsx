import type { Metadata } from "next";
import { GALLERY_COPY, LibraryGalleryPage, type GallerySearch } from "@/components/community/library/LibraryGalleryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workflow gallery · Monoes Community",
  description: GALLERY_COPY.workflow.blurb,
  alternates: { canonical: "/community/workflows" },
  openGraph: { title: "Workflow gallery · Monoes Community", description: GALLERY_COPY.workflow.blurb, type: "website" },
};

export default function Page({ searchParams }: { searchParams: GallerySearch }) {
  return <LibraryGalleryPage kind="workflow" searchParams={searchParams} />;
}
