import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { feature, featureVote, user } from "@/lib/db/schema";

export function isValidTitle(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 100;
}

export function isValidDescription(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 1000;
}

export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  const [features, votes, authors] = await Promise.all([
    db.select().from(feature),
    db.select().from(featureVote),
    db.select({ id: user.id, username: user.username }).from(user),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a.username]));
  const scoreByFeature = new Map<string, number>();
  const myVoteByFeature = new Map<string, number>();
  for (const v of votes) {
    scoreByFeature.set(v.featureId, (scoreByFeature.get(v.featureId) ?? 0) + v.value);
    if (v.userId === session.user.id) {
      myVoteByFeature.set(v.featureId, v.value);
    }
  }

  const result = features.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    authorId: f.authorId,
    authorUsername: authorMap.get(f.authorId) ?? null,
    status: f.status,
    createdAt: f.createdAt.toISOString(),
    score: scoreByFeature.get(f.id) ?? 0,
    myVote: myVoteByFeature.get(f.id) ?? 0,
  }));

  return NextResponse.json({ features: result });
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if ((session.user as { blockedAt?: unknown }).blockedAt) {
    return NextResponse.json({ error: "Account blocked" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { title?: unknown; description?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!isValidTitle(title)) {
    return NextResponse.json({ error: "Title must be 1-100 characters." }, { status: 400 });
  }
  if (!isValidDescription(description)) {
    return NextResponse.json({ error: "Description must be 1-1000 characters." }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  await db.insert(feature).values({
    id,
    title,
    description,
    authorId: session.user.id,
    status: "open",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    {
      id,
      title,
      description,
      authorId: session.user.id,
      status: "open",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    { status: 201 },
  );
}
