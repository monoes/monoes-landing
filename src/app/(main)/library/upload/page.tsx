import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/library/UploadForm";
import { isAdmin } from "@/lib/library/access";
import { getPageViewer } from "@/lib/library/page-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload · Library · monoes",
  robots: { index: false },
};

export default async function LibraryUploadPage() {
  const viewer = await getPageViewer();

  return (
    <main className="bg-ivory-warm px-4 pt-24 pb-16 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-espresso/60">
          <Link href="/library" className="hover:text-espresso">
            Library
          </Link>{" "}
          / Upload
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-espresso">Upload to your library</h1>
        <p className="mt-2 text-sm text-espresso/70">
          Items are private unless you make them public. From MonoAgent you can also publish with{" "}
          <code className="font-mono text-[13px]">monoagentcli library publish</code>.
        </p>
        {viewer && !viewer.blockedAt ? (
          <UploadForm isAdmin={isAdmin(viewer)} />
        ) : (
          <p className="mt-8 text-sm text-espresso/70">
            <Link href="/community/login" className="text-gold-dark underline-offset-2 hover:underline">
              Log in
            </Link>{" "}
            to upload.
          </p>
        )}
      </div>
    </main>
  );
}
