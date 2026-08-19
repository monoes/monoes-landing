export function isModerator(session: { user: unknown } | null): boolean {
  const sessionUser = session?.user as { role?: string; blockedAt?: unknown } | undefined;
  const role = sessionUser?.role;
  return !!session && (role === "admin" || role === "moderator") && !sessionUser?.blockedAt;
}
