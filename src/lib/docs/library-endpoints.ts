import type { AuthRequirement, EndpointGroup, Scope } from "./endpoint-registry";

// The Library group of the API reference (/docs/reference/library, OpenAPI),
// kept apart from endpoint-registry.ts for size.
const scope = (s: Scope): AuthRequirement => ({ kind: "scope", scope: s });
const publicAuth: AuthRequirement = { kind: "public" };

export const LIBRARY_ENDPOINTS: EndpointGroup = {
  slug: "library",
  name: "Library",
  description:
    "Workflows, web automations (.mpkg) and orgs that MonoAgent installs: list, download, publish and version them.",
  endpoints: [
    {
      method: "GET",
      path: "/api/library/items",
      summary: "List library items.",
      auth: publicAuth,
      request:
        "Query params: kind ('workflow'|'automation'|'org'), scope ('public' (default: public + official) | 'official' | 'mine'), q, tag, sort ('latest' (default, last updated first) | 'popular' (net votes first)), page (1-indexed), per_page (≤ 100, default 24)",
      response: "{ items: Item[], page, per_page, total }",
      notes:
        "scope=mine needs library:read (401 without credentials). Item: { id, kind, slug, name, description, version, visibility, tags, owner: { id, username, name }, sha256, size, meta, score (net community votes), created_at, updated_at, url, artifact_url }. The community workflow and web automation galleries (/community/workflows, /community/automations) are this list with scope=public and sort=latest|popular. Community gallery orgs are listed as public kind=org items with meta.gallery = true.",
    },
    {
      method: "GET",
      path: "/api/library/items/{ref}",
      summary: "Get one item by id, or by kind and slug (/api/library/items/automation/instagram).",
      auth: publicAuth,
      response: "Item",
      notes: "A private item is 404 unless the caller is its owner (session, or a token with library:read).",
    },
    {
      method: "GET",
      path: "/api/library/items/{id}/artifact",
      summary: "Download the artifact: an .mpkg for automations, JSON for workflows and orgs.",
      auth: scope("library:read"),
      request: "Query params: version (optional; defaults to the current version)",
      response:
        "The bytes, with Content-Type, Content-Length, Content-Disposition, X-Content-SHA256 (hex) and X-Library-Version headers",
      notes: "Downloading needs a login (a session or a token with library:read); anonymous callers get 401 'Log in to monoes.me to download'. Browsing (list, item, versions) is open to everyone. Verify X-Content-SHA256 before installing.",
    },
    {
      method: "GET",
      path: "/api/library/items/{id}/versions",
      summary: "List an item's versions, newest first.",
      auth: publicAuth,
      response: "{ versions: [{ version, sha256, size, created_at, artifact_url }] }",
    },
    {
      method: "POST",
      path: "/api/library/items",
      summary: "Publish a new item.",
      auth: scope("library:write"),
      requestType: "multipart",
      request:
        "multipart/form-data: kind, file, visibility ('private' default | 'public' | 'official' for admins), name?, description?, tags? (comma-separated), version? (semver)",
      response: "201 Item",
      notes:
        "The server validates the file: automations are .mpkg zips with a valid automation.json (≤ 20 MB; the item version is automation.json's); workflows are MonoAgent workflow exports (≤ 20 MB); orgs must pass the org schema (≤ 500 KB). meta is derived from the file. At most 30 uploads per hour (429).",
    },
    {
      method: "PUT",
      path: "/api/library/items/{id}/artifact",
      summary: "Publish a new version of an item you own.",
      auth: scope("library:write"),
      requestType: "multipart",
      request: "multipart/form-data: file, version? (semver; default: next patch, or automation.json's version)",
      response: "Item (with the new version)",
      notes: "The version must be newer than the current one (409 version_conflict). Earlier versions stay downloadable.",
    },
    {
      method: "PATCH",
      path: "/api/library/items/{id}",
      summary: "Edit an item you own.",
      auth: scope("library:write"),
      request: "{ name?, description?, tags?: string[] | string, visibility? }",
      response: "Item",
      notes: "Only admins move items into or out of 'official'. Gallery orgs are edited on the org gallery instead (409 gallery_org).",
    },
    {
      method: "DELETE",
      path: "/api/library/items/{id}",
      summary: "Delete an item and all its versions (owner or admin).",
      auth: scope("library:write"),
      response: "{ id, deleted: true }",
    },
    {
      method: "POST",
      path: "/api/community/library/{id}/vote",
      summary: "Upvote, downvote, or clear your vote on a public or official library item.",
      auth: scope("community:write"),
      request: "{ value: 1 | -1 | 0 }",
      response: "{ score, myVote }",
      notes: "Community conventions: errors are { error: string }. Private items and gallery orgs are 404 here; gallery orgs use /api/community/orgs/{id}/vote.",
    },
    {
      method: "POST",
      path: "/api/community/library/{id}/comments",
      summary: "Comment on a public or official library item.",
      auth: scope("community:write"),
      request: "{ body: string } (1–1000 characters)",
      response: "201 { id, itemId, authorId, authorUsername, body, createdAt }",
    },
    {
      method: "DELETE",
      path: "/api/community/library/{id}/comments/{commentId}",
      summary: "Delete a comment on a library item (its author, a moderator or an admin).",
      auth: scope("community:write"),
      response: "{ id }",
    },
    {
      method: "GET",
      path: "/api/library/me",
      summary: "Who the token belongs to, and what it was granted.",
      auth: publicAuth,
      response: "{ user: { id, name, username, email, image }, scopes: string[] }",
      notes: "Requires a session or any valid token (401 otherwise). MonoAgent uses it to show who is logged in.",
    },
  ],
};
