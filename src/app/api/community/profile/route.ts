import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export function isValidTagline(value: string): boolean {
  return value.trim().length <= 140;
}

export function isValidJobTitle(value: string): boolean {
  return value.trim().length <= 80;
}

export function isValidCompany(value: string): boolean {
  return value.trim().length <= 80;
}

export function isValidTags(value: string[]): boolean {
  if (value.length > 10) return false;
  return value.every((tag) => /^[a-zA-Z0-9_-]{1,24}$/.test(tag.trim()));
}

export function isValidSocialUrl(value: string, expectedHosts?: string[]): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (!expectedHosts) return true;
  return expectedHosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
}

export async function PATCH(request: Request) {
  const session = await getAuthenticatedUser(request, "community:write");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        tagline?: unknown;
        jobTitle?: unknown;
        company?: unknown;
        tags?: unknown;
        githubUrl?: unknown;
        twitterUrl?: unknown;
        linkedinUrl?: unknown;
        websiteUrl?: unknown;
      }
    | null;

  const tagline = typeof body?.tagline === "string" ? body.tagline.trim() : "";
  const jobTitle = typeof body?.jobTitle === "string" ? body.jobTitle.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim())
    : [];
  const githubUrl = typeof body?.githubUrl === "string" ? body.githubUrl.trim() : "";
  const twitterUrl = typeof body?.twitterUrl === "string" ? body.twitterUrl.trim() : "";
  const linkedinUrl = typeof body?.linkedinUrl === "string" ? body.linkedinUrl.trim() : "";
  const websiteUrl = typeof body?.websiteUrl === "string" ? body.websiteUrl.trim() : "";

  if (!isValidTagline(tagline)) {
    return NextResponse.json({ error: "Tagline must be 140 characters or fewer." }, { status: 400 });
  }
  if (!isValidJobTitle(jobTitle)) {
    return NextResponse.json({ error: "Job title must be 80 characters or fewer." }, { status: 400 });
  }
  if (!isValidCompany(company)) {
    return NextResponse.json({ error: "Company must be 80 characters or fewer." }, { status: 400 });
  }
  if (!isValidTags(tags)) {
    return NextResponse.json(
      { error: "Tags must be 10 or fewer, each 1-24 letters, numbers, underscore, or hyphen." },
      { status: 400 },
    );
  }
  if (!isValidSocialUrl(githubUrl, ["github.com"])) {
    return NextResponse.json({ error: "GitHub URL must be a valid https://github.com link." }, { status: 400 });
  }
  if (!isValidSocialUrl(twitterUrl, ["x.com", "twitter.com"])) {
    return NextResponse.json({ error: "X/Twitter URL must be a valid https://x.com or https://twitter.com link." }, { status: 400 });
  }
  if (!isValidSocialUrl(linkedinUrl, ["linkedin.com"])) {
    return NextResponse.json({ error: "LinkedIn URL must be a valid https://linkedin.com link." }, { status: 400 });
  }
  if (!isValidSocialUrl(websiteUrl)) {
    return NextResponse.json({ error: "Website URL must be a valid https:// link." }, { status: 400 });
  }

  const db = getDb();
  await db
    .update(user)
    .set({
      tagline: tagline || null,
      jobTitle: jobTitle || null,
      company: company || null,
      tagsJson: tags.length > 0 ? JSON.stringify(tags) : null,
      githubUrl: githubUrl || null,
      twitterUrl: twitterUrl || null,
      linkedinUrl: linkedinUrl || null,
      websiteUrl: websiteUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({
    tagline: tagline || null,
    jobTitle: jobTitle || null,
    company: company || null,
    tags,
    githubUrl: githubUrl || null,
    twitterUrl: twitterUrl || null,
    linkedinUrl: linkedinUrl || null,
    websiteUrl: websiteUrl || null,
  });
}
