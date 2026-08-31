export type AuthRequirement =
  | { kind: "public" }
  | { kind: "scope"; scope: "community:read" | "community:write" }
  | { kind: "role"; scope: "community:write" | "community:read"; roles: ("admin" | "moderator")[] };

export type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  auth: AuthRequirement;
  request?: string;
  response?: string;
  notes?: string;
};

export type EndpointGroup = {
  slug: string;
  name: string;
  description: string;
  endpoints: Endpoint[];
};

const scope = (s: "community:read" | "community:write"): AuthRequirement => ({ kind: "scope", scope: s });
const role = (s: "community:read" | "community:write", roles: ("admin" | "moderator")[]): AuthRequirement => ({
  kind: "role",
  scope: s,
  roles,
});
const publicAuth: AuthRequirement = { kind: "public" };

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    slug: "feed",
    name: "Feed",
    description: "The unified, cross-resource activity feed shown on the community homepage.",
    endpoints: [
      {
        method: "GET",
        path: "/api/community/feed",
        summary: "List recent activity across posts, bugs, features, and org uploads.",
        auth: publicAuth,
        request: "Query params: sort ('latest' | 'popular'), page (number, 0-indexed), authorId (string, optional)",
        response: "{ items: FeedItem[], hasMore: boolean }",
        notes:
          "Session is read if present (to compute the viewer's own vote on each item) but not required. A Bearer token without community:read is silently treated as anonymous rather than rejected.",
      },
    ],
  },
  {
    slug: "bugs",
    name: "Bugs",
    description: "Bug reports, voting, comments, and moderation labels.",
    endpoints: [
      {
        method: "POST",
        path: "/api/community/bugs",
        summary: "File a bug report.",
        auth: scope("community:write"),
        request: "{ title: string, description: string, severity: 'low'|'medium'|'high'|'critical' }",
        response: "201 { id, title, description, authorId, status: 'open', severity, createdAt, updatedAt }",
        notes: "title 1-100 chars, description 1-1000 chars.",
      },
      {
        method: "PATCH",
        path: "/api/community/bugs/{id}",
        summary: "Update a bug's status and/or severity.",
        auth: role("community:write", ["admin", "moderator"]),
        request: "{ status?: 'open'|'in_progress'|'resolved'|'wontfix', severity?: 'low'|'medium'|'high'|'critical' }",
        response: "{ status?, severity? }",
        notes: "At least one field required.",
      },
      {
        method: "DELETE",
        path: "/api/community/bugs/{id}",
        summary: "Delete a bug report.",
        auth: role("community:write", ["admin", "moderator"]),
        response: "{ id }",
      },
      {
        method: "POST",
        path: "/api/community/bugs/{id}/vote",
        summary: "Upvote, downvote, or clear your vote on a bug.",
        auth: scope("community:write"),
        request: "{ value: 1 | -1 | 0 }",
        response: "{ score: number, myVote: 1|-1|0 }",
        notes: "0 removes an existing vote. Idempotent upsert per (bug, user).",
      },
      {
        method: "POST",
        path: "/api/community/bugs/{id}/comments",
        summary: "Post a comment on a bug.",
        auth: scope("community:write"),
        request: "{ body: string }",
        response: "201 { id, bugId, authorId, authorUsername, body, createdAt }",
        notes: "body 1-1000 chars.",
      },
      {
        method: "DELETE",
        path: "/api/community/bugs/{id}/comments/{commentId}",
        summary: "Delete your own comment (or any comment, as a moderator/admin).",
        auth: scope("community:write"),
        response: "{ id }",
      },
      {
        method: "POST",
        path: "/api/community/bugs/{id}/labels",
        summary: "Attach a label to a bug.",
        auth: role("community:write", ["admin", "moderator"]),
        request: "{ labelId: string }",
        response: "{ bugId, labelId }",
        notes: "Idempotent: attaching an already-attached label is a no-op.",
      },
      {
        method: "DELETE",
        path: "/api/community/bugs/{id}/labels/{labelId}",
        summary: "Detach a label from a bug.",
        auth: role("community:write", ["admin", "moderator"]),
        response: "{ bugId, labelId }",
      },
    ],
  },
  {
    slug: "labels",
    name: "Labels",
    description: "Moderator-managed labels attachable to bug reports.",
    endpoints: [
      {
        method: "POST",
        path: "/api/community/labels",
        summary: "Create a new label.",
        auth: role("community:write", ["admin", "moderator"]),
        request: "{ name: string, color: string }",
        response: "201 { id, name, color }",
        notes: "name 1-30 chars; color is a #rrggbb hex string; 409 if the name is already taken.",
      },
    ],
  },
  {
    slug: "features",
    name: "Feature requests",
    description: "Community feature requests and voting.",
    endpoints: [
      {
        method: "POST",
        path: "/api/community/features",
        summary: "Submit a feature request.",
        auth: scope("community:write"),
        request: "{ title: string, description: string }",
        response: "201 { id, title, description, authorId, status: 'open', createdAt, updatedAt }",
        notes: "title 1-100 chars, description 1-1000 chars.",
      },
      {
        method: "DELETE",
        path: "/api/community/features/{id}",
        summary: "Delete a feature request.",
        auth: role("community:write", ["admin", "moderator"]),
        response: "{ id }",
      },
      {
        method: "PATCH",
        path: "/api/community/features/{id}/status",
        summary: "Change a feature request's status.",
        auth: role("community:write", ["admin"]),
        request: "{ status: 'open'|'planned'|'shipped'|'declined' }",
        response: "{ status }",
      },
      {
        method: "POST",
        path: "/api/community/features/{id}/vote",
        summary: "Upvote, downvote, or clear your vote on a feature request.",
        auth: scope("community:write"),
        request: "{ value: 1 | -1 | 0 }",
        response: "{ score: number, myVote: 1|-1|0 }",
      },
    ],
  },
  {
    slug: "orgs",
    name: "Org gallery",
    description: "Uploaded agent-org definitions, voting, comments, banner images, and run outputs.",
    endpoints: [
      {
        method: "POST",
        path: "/api/community/orgs",
        summary: "Upload an org definition (JSON matching the org schema).",
        auth: scope("community:write"),
        request: "{ orgJson: string }, a JSON-encoded org definition, max 500 KB",
        response: "201 { id, name, goal, topology, roleCount, createdAt }",
        notes:
          "orgJson is validated against a Zod schema before insert. The request also needs a numeric Content-Length header under ~1 MB — a chunked-transfer client with no Content-Length is rejected outright, regardless of the actual body size.",
      },
      {
        method: "PATCH",
        path: "/api/community/orgs/{id}",
        summary: "Update an org's name, tagline, description, body, or banner image.",
        auth: scope("community:write"),
        request: "{ name?, tagline?, description?, body?, bannerUrl? } (all optional, at least one required)",
        response: "{ id, ...updatedFields }",
        notes:
          "Requires ownership (or moderator/admin). Limits: name 1-100 chars, tagline ≤150, description ≤1000, body ≤20000. bannerUrl must start with /api/images/org/ or be null; empty strings on tagline/description/body are coerced to null.",
      },
      {
        method: "DELETE",
        path: "/api/community/orgs/{id}",
        summary: "Delete an org upload.",
        auth: scope("community:write"),
        response: "{ id }",
      },
      {
        method: "POST",
        path: "/api/community/orgs/{id}/vote",
        summary: "Upvote, downvote, or clear your vote on an org.",
        auth: scope("community:write"),
        request: "{ value: 1 | -1 | 0 }",
        response: "{ score: number, myVote: 1|-1|0 }",
      },
      {
        method: "POST",
        path: "/api/community/orgs/{id}/comments",
        summary: "Post a comment on an org.",
        auth: scope("community:write"),
        request: "{ body: string }",
        response: "201 { id, orgUploadId, authorId, authorUsername, body, createdAt }",
        notes: "body 1-1000 chars.",
      },
      {
        method: "DELETE",
        path: "/api/community/orgs/{id}/comments/{commentId}",
        summary: "Delete your own comment (or any comment, as a moderator/admin).",
        auth: scope("community:write"),
        response: "{ id }",
      },
      {
        method: "POST",
        path: "/api/community/orgs/{id}/images",
        summary: "Upload an image (used for the org body and/or banner).",
        auth: scope("community:write"),
        request: "multipart/form-data, field 'image': PNG/JPEG/WebP, max 2 MB",
        response: "201 { url }",
      },
      {
        method: "POST",
        path: "/api/community/orgs/{id}/runs",
        summary: "Upload a run's output files (Markdown and/or HTML).",
        auth: scope("community:write"),
        request: "multipart/form-data: field 'label' (string, optional, ≤100 chars), field 'files' (up to 10 .md/.html files, 2 MB each)",
        response: "201 { id, label: string | null, createdAt, files: [{ id, filename, fileType, sizeBytes }] }",
        notes: "label is optional despite the field existing — a blank or missing label is stored as null.",
      },
      {
        method: "DELETE",
        path: "/api/community/orgs/{id}/runs/{runId}",
        summary: "Delete a run and its files.",
        auth: scope("community:write"),
        response: "{ id }",
        notes: "Requires ownership of the run (or moderator/admin).",
      },
      {
        method: "GET",
        path: "/api/community/org-run-files/{fileId}",
        summary: "Fetch a run output file's raw content.",
        auth: publicAuth,
        response: "The raw file body, Content-Type text/markdown or text/html.",
        notes: "Unauthenticated: anyone with the file id can view it, same as the linked org.",
      },
    ],
  },
  {
    slug: "posts",
    name: "Posts",
    description: "Free-form community posts and voting.",
    endpoints: [
      {
        method: "POST",
        path: "/api/community/posts",
        summary: "Create a post.",
        auth: scope("community:write"),
        request: "{ title: string, body: string }",
        response: "201 { id, title, body, authorId, createdAt }",
        notes: "title 1-100 chars, body 1-2000 chars.",
      },
      {
        method: "POST",
        path: "/api/community/posts/{id}/vote",
        summary: "Upvote, downvote, or clear your vote on a post.",
        auth: scope("community:write"),
        request: "{ value: 1 | -1 | 0 }",
        response: "{ score: number, myVote: 1|-1|0 }",
      },
    ],
  },
  {
    slug: "blog",
    name: "Blog comments",
    description: "Comments on monoes.me blog posts.",
    endpoints: [
      {
        method: "POST",
        path: "/api/community/blog/{slug}/comments",
        summary: "Post a comment on a blog post.",
        auth: scope("community:write"),
        request: "{ body: string }",
        response: "201 { id, postSlug, authorId, authorUsername, body, createdAt }",
        notes: "slug must match a real post; body 1-1000 chars.",
      },
      {
        method: "DELETE",
        path: "/api/community/blog/{slug}/comments/{commentId}",
        summary: "Delete your own comment (or any comment, as a moderator/admin).",
        auth: scope("community:write"),
        response: "{ id }",
      },
    ],
  },
  {
    slug: "profile",
    name: "Profile & identity",
    description: "The authenticated user's own profile: identity, avatar, and username.",
    endpoints: [
      {
        method: "GET",
        path: "/api/community/me",
        summary: "Get the authenticated user's id, username, name, and avatar URL.",
        auth: scope("community:read"),
        response: "{ id, username, name: string | null, avatarUrl: string | null }",
        notes: "avatarUrl (when set) is /api/images/avatar/<key>?v=<updatedAt ms> — the query param is a cache-buster, not part of the key.",
      },
      {
        method: "PATCH",
        path: "/api/community/profile",
        summary: "Update your profile: name, tagline, job, tags, and social links.",
        auth: scope("community:write"),
        request:
          "{ name, tagline?, jobTitle?, company?, tags?: string[], githubUrl?, twitterUrl?, linkedinUrl?, websiteUrl? }",
        response: "{ name, tagline, jobTitle, company, tags, githubUrl, twitterUrl, linkedinUrl, websiteUrl }",
        notes:
          "name required, 1-100 chars. tagline ≤140, jobTitle ≤80, company ≤80. Up to 10 tags (1-24 chars, alnum/underscore/hyphen). githubUrl/linkedinUrl must be https and match their platform's domain; twitterUrl accepts twitter.com or x.com (or a subdomain of either); websiteUrl just needs to be https.",
      },
      {
        method: "POST",
        path: "/api/community/profile/avatar",
        summary: "Upload a new avatar image.",
        auth: scope("community:write"),
        request: "multipart/form-data, field 'avatar': PNG/JPEG/WebP, max 2 MB",
        response: "{ avatarKey, updatedAt }",
        notes: "Stored at a fixed per-user key (avatars/<userId>) — re-uploading overwrites the previous image.",
      },
      {
        method: "POST",
        path: "/api/community/username",
        summary: "Set or change your username (required once, during onboarding).",
        auth: scope("community:write"),
        request: "{ username: string }",
        response: "{ username }",
        notes:
          "3-24 chars, letters/numbers/underscore/hyphen; must be unique — a taken username is a 400, not a 409 (see /docs/errors).",
      },
    ],
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Admin-only user management (blocking is also available to moderators).",
    endpoints: [
      {
        method: "GET",
        path: "/api/community/admin/users",
        summary: "List all users.",
        auth: role("community:read", ["admin"]),
        response: "{ users: [{ id, email, username, role, blockedAt, createdAt }] }",
        notes: "Admin-only — a moderator token gets 403 here.",
      },
      {
        method: "PATCH",
        path: "/api/community/admin/users/{id}/block",
        summary: "Block or unblock a user.",
        auth: role("community:write", ["admin", "moderator"]),
        request: "{ blocked: boolean }",
        response: "{ blockedAt: string | null }",
        notes: "blockedAt is an ISO timestamp when blocking, null when unblocking.",
      },
      {
        method: "PATCH",
        path: "/api/community/admin/users/{id}/role",
        summary: "Change a user's role.",
        auth: role("community:write", ["admin"]),
        request: "{ role: 'member'|'moderator'|'admin' }",
        response: "{ role }",
      },
    ],
  },
];

export function allEndpoints(): (Endpoint & { group: string })[] {
  return ENDPOINT_GROUPS.flatMap((g) => g.endpoints.map((e) => ({ ...e, group: g.name })));
}
