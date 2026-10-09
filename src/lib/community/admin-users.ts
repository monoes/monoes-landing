// Pure helpers shared by the admin users list and user detail page. Kept free
// of "@/..." imports so they're unit-testable under plain `node --test`.

export type UserRole = "member" | "moderator" | "admin";

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  role: UserRole;
  blockedAt: string | null;
  createdAt: string;
  avatarUrl: string | null;
  providers: string[];
  lastActiveAt: string | null;
  sessionCount: number;
  contributionCount: number;
  voteCount: number;
};

export type ActivityKind =
  | "signup"
  | "sign_in"
  | "account_linked"
  | "app_authorized"
  | "post"
  | "feature"
  | "bug"
  | "bug_comment"
  | "org_upload"
  | "org_run"
  | "org_comment"
  | "blog_comment"
  | "library_item"
  | "library_comment"
  | "vote";

export type ActivityItem = {
  kind: ActivityKind;
  label: string;
  detail: string | null;
  href: string | null;
  at: string;
};

export type UserFilter = "all" | "active" | "blocked" | "staff";
export type UserSort = "joined" | "active" | "contributions";

export const PROVIDER_LABEL: Record<string, string> = {
  credential: "Email & password",
  google: "Google",
};

export function buildActivityTimeline(items: ActivityItem[], limit: number): ActivityItem[] {
  return [...items].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit);
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const OPERATING_SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

export function summarizeUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown";
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const os = OPERATING_SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? userAgent.slice(0, 60);
}

// The D1 driver doesn't always auto-parse `{ mode: "json" }` columns (see
// get-authenticated-user.ts), so accept both an array and its JSON string.
export function parseStringList(value: unknown): string[] {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
}

export function formatRelativeTime(iso: string | null, now: number): string {
  if (!iso) return "Never";
  const seconds = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 30) return `${Math.floor(days)}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function filterAndSortUsers(
  users: AdminUserSummary[],
  { query, filter, sort }: { query: string; filter: UserFilter; sort: UserSort },
): AdminUserSummary[] {
  const needle = query.trim().toLowerCase();
  const matches = users.filter((u) => {
    if (filter === "active" && u.blockedAt) return false;
    if (filter === "blocked" && !u.blockedAt) return false;
    if (filter === "staff" && u.role === "member") return false;
    if (!needle) return true;
    return [u.email, u.name, u.username ?? ""].some((field) => field.toLowerCase().includes(needle));
  });

  return matches.sort((a, b) => {
    if (sort === "contributions") return b.contributionCount - a.contributionCount;
    if (sort === "active") {
      return (b.lastActiveAt ? Date.parse(b.lastActiveAt) : 0) - (a.lastActiveAt ? Date.parse(a.lastActiveAt) : 0);
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}
