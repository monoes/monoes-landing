import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getFeedItems } from "@/lib/community/feed";
import { getHubData, type HubGallery } from "@/lib/community/hub-data";
import { FeedList } from "@/components/community/feed/FeedList";
import { HubHero } from "@/components/community/hub/HubHero";
import { GalleryPanels } from "@/components/community/hub/GalleryPanels";
import { HubAside } from "@/components/community/hub/HubAside";
import type { ConstellationNode } from "@/components/community/hub/Constellation";

const DESCRIPTION =
  "Share and install MonoAgent orgs, workflows and web automations, vote on the best, and help shape what monoes builds next.";

export const metadata: Metadata = {
  title: "Community",
  description: DESCRIPTION,
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Monoes Community",
    description: DESCRIPTION,
    images: [{ url: "/images/community/hero-network.webp", alt: "A golden network of connected nodes" }],
  },
};

export const dynamic = "force-dynamic";

const NODE_KIND = { orgs: "org", workflows: "workflow", automations: "automation" } as const;

/** Newest items, alternating galleries: org, workflow, automation, org, … */
function constellationNodes(galleries: HubGallery[]): ConstellationNode[] {
  const nodes: ConstellationNode[] = [];
  for (let i = 0; i < 3; i++) {
    for (const g of galleries) {
      const entry = g.latest[i];
      if (entry) nodes.push({ kind: NODE_KIND[g.key], name: entry.name });
    }
  }
  if (nodes.length > 0) return nodes;
  // An empty community still gets a picture of what the galleries hold.
  return [
    { kind: "org", name: "Orgs" },
    { kind: "workflow", name: "Workflows" },
    { kind: "automation", name: "Web automations" },
  ];
}

export default async function CommunityPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const [{ items, hasMore }, hub] = await Promise.all([
    getFeedItems({ sort: "latest", page: 0, currentUserId: session?.user.id }),
    getHubData(),
  ]);

  return (
    // pt-0!: the hero runs right up to the section menu.
    <main className="bg-ivory-warm pt-0! pb-20">
      <HubHero nodes={constellationNodes(hub.galleries)} signedIn={!!session} />
      <GalleryPanels galleries={hub.galleries} />

      <section aria-labelledby="feed-title" className="mx-auto max-w-6xl px-4 pt-16 sm:px-8 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 id="feed-title" className="text-3xl font-semibold tracking-tight text-espresso sm:text-4xl">
              What&apos;s happening
            </h2>
            <p className="mt-2 mb-6 text-base text-espresso/75">
              New orgs, workflows, automations, posts, feature requests and bug reports, as they land.
            </p>
            <FeedList initialItems={items} initialHasMore={hasMore} />
          </div>
          <HubAside openFeatures={hub.openFeatures} openBugs={hub.openBugs} />
        </div>
      </section>
    </main>
  );
}
