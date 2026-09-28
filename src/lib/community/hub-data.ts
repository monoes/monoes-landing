import { and, count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { bug, feature, orgUpload } from "@/lib/db/schema";
import { libraryItem } from "@/lib/db/library-schema";

export type HubEntry = { name: string; href: string };

export type HubGallery = {
  key: "orgs" | "workflows" | "automations";
  /** null when the viewer isn't logged in: gallery contents are for members only. */
  count: number | null;
  latest: HubEntry[];
};

export type HubData = {
  galleries: HubGallery[];
  openFeatures: number;
  openBugs: number;
};

const LATEST = 3;

async function libraryGallery(kind: "workflow" | "automation"): Promise<HubGallery> {
  const db = getDb();
  const where = and(eq(libraryItem.kind, kind), inArray(libraryItem.visibility, ["public", "official"]));
  const segment = kind === "workflow" ? "workflows" : "automations";
  const [[total], rows] = await Promise.all([
    db.select({ n: count() }).from(libraryItem).where(where),
    db
      .select({ name: libraryItem.name, slug: libraryItem.slug })
      .from(libraryItem)
      .where(where)
      .orderBy(desc(libraryItem.createdAt))
      .limit(LATEST),
  ]);
  return {
    key: segment,
    count: total.n,
    latest: rows.map((r) => ({ name: r.name, href: `/library/${segment}/${r.slug}` })),
  };
}

/** Counts and newest entries for the /community hub; gallery contents only for logged-in viewers. */
export async function getHubData(signedIn: boolean): Promise<HubData> {
  const db = getDb();
  if (!signedIn) {
    const [[features], [bugs]] = await Promise.all([
      db.select({ n: count() }).from(feature).where(eq(feature.status, "open")),
      db.select({ n: count() }).from(bug).where(eq(bug.status, "open")),
    ]);
    return {
      galleries: (["orgs", "workflows", "automations"] as const).map((key) => ({ key, count: null, latest: [] })),
      openFeatures: features.n,
      openBugs: bugs.n,
    };
  }
  const [[orgTotal], orgRows, workflows, automations, [features], [bugs]] = await Promise.all([
    db.select({ n: count() }).from(orgUpload),
    db
      .select({ id: orgUpload.id, slug: orgUpload.slug, name: orgUpload.name })
      .from(orgUpload)
      .orderBy(desc(orgUpload.createdAt))
      .limit(LATEST),
    libraryGallery("workflow"),
    libraryGallery("automation"),
    db.select({ n: count() }).from(feature).where(eq(feature.status, "open")),
    db.select({ n: count() }).from(bug).where(eq(bug.status, "open")),
  ]);
  return {
    galleries: [
      {
        key: "orgs",
        count: orgTotal.n,
        latest: orgRows.map((o) => ({ name: o.name, href: `/community/orgs/${o.slug ?? o.id}` })),
      },
      workflows,
      automations,
    ],
    openFeatures: features.n,
    openBugs: bugs.n,
  };
}
