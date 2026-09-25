import { eq, or } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { orgUpload } from "@/lib/db/schema";

/** Org pages are addressable by slug (canonical) or by id (older links). */
export async function findOrgUpload(db: ReturnType<typeof getDb>, idOrSlug: string) {
  const [row] = await db
    .select()
    .from(orgUpload)
    .where(or(eq(orgUpload.id, idOrSlug), eq(orgUpload.slug, idOrSlug)))
    .limit(1);
  return row ?? null;
}
