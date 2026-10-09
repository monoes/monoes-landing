import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildActivityTimeline,
  filterAndSortUsers,
  formatRelativeTime,
  parseStringList,
  summarizeUserAgent,
  type ActivityItem,
  type AdminUserSummary,
} from "./admin-users.ts";

function makeUser(overrides: Partial<AdminUserSummary>): AdminUserSummary {
  return {
    id: "u",
    name: "User",
    email: "user@example.com",
    emailVerified: false,
    username: "user",
    role: "member",
    blockedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    avatarUrl: null,
    providers: ["credential"],
    lastActiveAt: null,
    sessionCount: 0,
    contributionCount: 0,
    voteCount: 0,
    ...overrides,
  };
}

describe("summarizeUserAgent", () => {
  it("returns Unknown for a missing user agent", () => {
    assert.equal(summarizeUserAgent(null), "Unknown");
    assert.equal(summarizeUserAgent(""), "Unknown");
  });

  it("detects Chrome on macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
    assert.equal(summarizeUserAgent(ua), "Chrome on macOS");
  });

  it("detects Edge on Windows before Chrome", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0";
    assert.equal(summarizeUserAgent(ua), "Edge on Windows");
  });

  it("detects Safari on iOS", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    assert.equal(summarizeUserAgent(ua), "Safari on iOS");
  });

  it("detects Firefox on Linux", () => {
    const ua = "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0";
    assert.equal(summarizeUserAgent(ua), "Firefox on Linux");
  });

  it("falls back to the truncated raw string for non-browser clients", () => {
    assert.equal(summarizeUserAgent("node-fetch/1.0"), "node-fetch/1.0");
    assert.equal(summarizeUserAgent("x".repeat(100)).length, 60);
  });
});

describe("parseStringList", () => {
  it("accepts an array", () => {
    assert.deepEqual(parseStringList(["openid", "email"]), ["openid", "email"]);
  });

  it("accepts a JSON-encoded array string", () => {
    assert.deepEqual(parseStringList('["community:read"]'), ["community:read"]);
  });

  it("returns an empty list for invalid input", () => {
    assert.deepEqual(parseStringList("not json"), []);
    assert.deepEqual(parseStringList(null), []);
    assert.deepEqual(parseStringList('{"a":1}'), []);
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-09-17T12:00:00.000Z");

  it("returns Never for null", () => {
    assert.equal(formatRelativeTime(null, now), "Never");
  });

  it("formats recent, hour, day, and month offsets", () => {
    assert.equal(formatRelativeTime("2026-09-17T11:59:30.000Z", now), "Just now");
    assert.equal(formatRelativeTime("2026-09-17T11:15:00.000Z", now), "45m ago");
    assert.equal(formatRelativeTime("2026-09-17T09:00:00.000Z", now), "3h ago");
    assert.equal(formatRelativeTime("2026-09-12T12:00:00.000Z", now), "5d ago");
    assert.equal(formatRelativeTime("2026-06-17T12:00:00.000Z", now), "3mo ago");
    assert.equal(formatRelativeTime("2024-09-17T12:00:00.000Z", now), "2y ago");
  });
});

describe("buildActivityTimeline", () => {
  const item = (label: string, at: string): ActivityItem => ({ kind: "post", label, detail: null, href: null, at });

  it("sorts newest first and applies the limit", () => {
    const result = buildActivityTimeline(
      [item("old", "2026-01-01T00:00:00.000Z"), item("new", "2026-03-01T00:00:00.000Z"), item("mid", "2026-02-01T00:00:00.000Z")],
      2,
    );
    assert.deepEqual(
      result.map((r) => r.label),
      ["new", "mid"],
    );
  });
});

describe("filterAndSortUsers", () => {
  const users = [
    makeUser({ id: "a", email: "alice@example.com", name: "Alice", username: "alice", role: "admin", createdAt: "2026-01-01T00:00:00.000Z", lastActiveAt: "2026-09-01T00:00:00.000Z", contributionCount: 2, voteCount: 1 }),
    makeUser({ id: "b", email: "bob@example.com", name: "Bob", username: null, blockedAt: "2026-05-01T00:00:00.000Z", createdAt: "2026-03-01T00:00:00.000Z", contributionCount: 9 }),
    makeUser({ id: "c", email: "carol@corp.io", name: "Carol", username: "carol", role: "moderator", createdAt: "2026-02-01T00:00:00.000Z", lastActiveAt: "2026-09-10T00:00:00.000Z" }),
  ];

  it("searches email, name, and username case-insensitively", () => {
    assert.deepEqual(filterAndSortUsers(users, { query: "CORP", filter: "all", sort: "joined" }).map((u) => u.id), ["c"]);
    assert.deepEqual(filterAndSortUsers(users, { query: "bob", filter: "all", sort: "joined" }).map((u) => u.id), ["b"]);
  });

  it("filters by status and role", () => {
    assert.deepEqual(filterAndSortUsers(users, { query: "", filter: "blocked", sort: "joined" }).map((u) => u.id), ["b"]);
    assert.deepEqual(filterAndSortUsers(users, { query: "", filter: "active", sort: "joined" }).map((u) => u.id), ["c", "a"]);
    assert.deepEqual(filterAndSortUsers(users, { query: "", filter: "staff", sort: "joined" }).map((u) => u.id), ["c", "a"]);
  });

  it("sorts by join date, last activity (never-active last), and contributions", () => {
    assert.deepEqual(filterAndSortUsers(users, { query: "", filter: "all", sort: "joined" }).map((u) => u.id), ["b", "c", "a"]);
    assert.deepEqual(filterAndSortUsers(users, { query: "", filter: "all", sort: "active" }).map((u) => u.id), ["c", "a", "b"]);
    assert.deepEqual(filterAndSortUsers(users, { query: "", filter: "all", sort: "contributions" }).map((u) => u.id), ["b", "a", "c"]);
  });
});
