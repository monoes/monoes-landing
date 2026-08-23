import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { getFeedItems, parseSort, parsePage } from "@/lib/community/feed";

export async function GET(request: Request) {
  const session = await getAuthenticatedUser(request, "community:read");
  const url = new URL(request.url);
  const sort = parseSort(url.searchParams.get("sort"));
  const page = parsePage(url.searchParams.get("page"));
  const authorId = url.searchParams.get("authorId") ?? undefined;

  const result = await getFeedItems({ sort, page, authorId, currentUserId: session?.user.id });

  return NextResponse.json(result);
}
