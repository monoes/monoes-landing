import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Community",
  description: "Report bugs, request features, and browse the org gallery.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Monoes Community",
    description: "Report bugs, request features, and browse the org gallery.",
  },
};

// Session-aware since Task 14 — getAuth()/getCloudflareContext() require a
// dynamic (per-request) render, so this page can no longer be statically
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <main>
      <section className="flex min-h-[70vh] items-center justify-center bg-ivory-warm px-8 pt-16 text-center">
        <div>
          <p className="mb-4 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
          <h1 className="mb-8 text-4xl font-semibold text-espresso md:text-5xl tracking-tight">
            Report bugs. Request features.<br />Share your orgs.
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            {session ? (
              <>
                {role === "admin" && (
                  <Link href="/community/admin" className="bg-espresso text-ivory rounded-md px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80">
                    Admin dashboard
                  </Link>
                )}
                <Link href="/community/features" className="bg-espresso text-ivory rounded-md px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80">
                  Feature requests
                </Link>
                <Link href="/community/bugs" className="rounded-md border border-espresso/30 px-5 py-2 text-sm text-espresso font-medium transition-colors hover:border-espresso">
                  Bug reports
                </Link>
                <Link href="/community/orgs" className="rounded-md border border-espresso/30 px-5 py-2 text-sm text-espresso font-medium transition-colors hover:border-espresso">
                  Org gallery
                </Link>
              </>
            ) : (
              <>
                <Link href="/community/register" className="bg-espresso text-ivory rounded-md px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80">
                  Join the community
                </Link>
                <Link href="/community/login" className="rounded-md border border-espresso/30 px-5 py-2 text-sm text-espresso font-medium transition-colors hover:border-espresso">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
