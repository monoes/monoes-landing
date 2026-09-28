import type { Metadata } from "next";
import { GALLERY_COPY, LibraryGalleryPage, type GallerySearch } from "@/components/community/library/LibraryGalleryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Members-only page (login required): keep it out of search results.
  robots: { index: false, follow: false },
  title: "Web automation gallery · Monoes Community",
  description: GALLERY_COPY.automation.blurb,
  alternates: { canonical: "/community/automations" },
  openGraph: { title: "Web automation gallery · Monoes Community", description: GALLERY_COPY.automation.blurb, type: "website" },
};

export default function Page({ searchParams }: { searchParams: GallerySearch }) {
  return <LibraryGalleryPage kind="automation" searchParams={searchParams} />;
}
