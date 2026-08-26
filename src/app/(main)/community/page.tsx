import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getFeedItems } from "@/lib/community/feed";
import { FeedList } from "@/components/community/feed/FeedList";

export const metadata: Metadata = {
  title: "Community",
  description: "Report bugs, request features, and browse the org gallery.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Monoes Community",
    description: "Report bugs, request features, and browse the org gallery.",
  },
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  const username = (session?.user as { username?: string } | undefined)?.username;

  const { items, hasMore } = await getFeedItems({ sort: "latest", page: 0, currentUserId: session?.user.id });

  return (
    <main>
      <section className="bg-ivory-warm px-8 pt-24 pb-8 text-center">
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
              {username && (
                <Link href={`/community/u/${username}`} className="rounded-md border border-espresso/30 px-5 py-2 text-sm text-espresso font-medium transition-colors hover:border-espresso">
                  My profile
                </Link>
              )}
              <Link href="/community/features" className="rounded-md border border-espresso/30 px-5 py-2 text-sm text-espresso font-medium transition-colors hover:border-espresso">
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
      </section>

      <section className="bg-ivory-warm px-8 pb-16">
        <div className="mx-auto max-w-3xl">
          <FeedList initialItems={items} initialHasMore={hasMore} />
        </div>
      </section>
    </main>
  );
}
