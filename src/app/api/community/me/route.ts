import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/community/get-authenticated-user";

export async function GET(request: Request) {
  const session = await getAuthenticatedUser(request, "community:read");
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ id: session.user.id, username: session.user.username });
}
