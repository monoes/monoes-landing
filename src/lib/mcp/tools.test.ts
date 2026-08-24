import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { z } from "zod";

// tools.ts unconditionally imports all 11 community route handler modules
// at the top level. Their business logic is already covered by each
// route's own route.test.ts, and the generic dispatch mechanics
// (callJsonRoute/callFormRoute) are covered by call-route.test.ts — so
// these stubs exist only to satisfy import resolution and to make every
// write-scoped route's auth check deterministically fail (401), letting
// these tests verify wiring (right handler, right URL/params, right
// error-mapping) without needing a full D1/drizzle mock.
register(
  `data:text/javascript,
  const ROUTE_SPECIFIERS = {
    "@/app/api/community/feed/route": "../../app/api/community/feed/route.ts",
    "@/app/api/community/features/route": "../../app/api/community/features/route.ts",
    "@/app/api/community/features/[id]/vote/route": "../../app/api/community/features/[id]/vote/route.ts",
    "@/app/api/community/bugs/route": "../../app/api/community/bugs/route.ts",
    "@/app/api/community/bugs/[id]/vote/route": "../../app/api/community/bugs/[id]/vote/route.ts",
    "@/app/api/community/bugs/[id]/comments/route": "../../app/api/community/bugs/[id]/comments/route.ts",
    "@/app/api/community/orgs/route": "../../app/api/community/orgs/route.ts",
    "@/app/api/community/orgs/[id]/vote/route": "../../app/api/community/orgs/[id]/vote/route.ts",
    "@/app/api/community/orgs/[id]/runs/route": "../../app/api/community/orgs/[id]/runs/route.ts",
    "@/app/api/community/posts/route": "../../app/api/community/posts/route.ts",
    "@/app/api/community/posts/[id]/vote/route": "../../app/api/community/posts/[id]/vote/route.ts",
  };
  export function resolve(specifier, context, next) {
    if (specifier in ROUTE_SPECIFIERS) return next(ROUTE_SPECIFIERS[specifier], context);
    if (specifier === "./call-route") return next("./call-route.ts", context);
    if (specifier === "next/server") return next("next/server.js", context);
    if (specifier === "@/lib/community/get-authenticated-user") {
      return { url: "data:text/javascript,export const getAuthenticatedUser = async () => null;", shortCircuit: true };
    }
    if (specifier === "@/lib/community/feed") {
      return {
        url: "data:text/javascript,export const getFeedItems = async () => ({ items: [], hasMore: false }); export const parseSort = (v) => v === 'popular' ? 'popular' : 'latest'; export const parsePage = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : 0; };",
        shortCircuit: true,
      };
    }
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return {
        url: "data:text/javascript,export const feature = {}; export const featureVote = {}; export const bug = {}; export const bugVote = {}; export const bugComment = {}; export const user = {}; export const orgUpload = {}; export const orgVote = {}; export const orgRun = {}; export const orgRunFile = {}; export const post = {}; export const postVote = {};",
        shortCircuit: true,
      };
    }
    if (specifier === "@/lib/org-schema") {
      return {
        url: "data:text/javascript,export const OrgDefSchema = { safeParse: () => ({ success: false, error: { issues: [{ path: [], message: 'stub' }] } }) };",
        shortCircuit: true,
      };
    }
    if (specifier === "@opennextjs/cloudflare") {
      return { url: "data:text/javascript,export const getCloudflareContext = () => ({ env: {} });", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { TOOL_DEFINITIONS } = await import("./tools.ts");

const EXPECTED_TOOL_NAMES = [
  "get_feed",
  "create_feature",
  "vote_feature",
  "create_bug",
  "vote_bug",
  "comment_bug",
  "create_org",
  "vote_org",
  "run_org",
  "create_post",
  "vote_post",
];

function findTool(name: string) {
  const tool = TOOL_DEFINITIONS.find((t) => t.name === name);
  assert.ok(tool, `expected a tool named ${name}`);
  return tool!;
}

describe("TOOL_DEFINITIONS", () => {
  it("defines exactly the 11 tools matching the community OpenAPI surface", () => {
    assert.deepEqual(
      TOOL_DEFINITIONS.map((t) => t.name).sort(),
      [...EXPECTED_TOOL_NAMES].sort(),
    );
  });

  it("every tool has a non-empty title and description", () => {
    for (const tool of TOOL_DEFINITIONS) {
      assert.ok(tool.title.length > 0, `${tool.name} missing title`);
      assert.ok(tool.description.length > 0, `${tool.name} missing description`);
    }
  });
});

describe("input schema validation", () => {
  it("get_feed accepts an empty object and rejects an invalid sort value", () => {
    const schema = z.object(findTool("get_feed").inputSchema);
    assert.equal(schema.safeParse({}).success, true);
    assert.equal(schema.safeParse({ sort: "trending" }).success, false);
    assert.equal(schema.safeParse({ sort: "popular", page: 2 }).success, true);
  });

  it("create_feature rejects a title over 100 characters", () => {
    const schema = z.object(findTool("create_feature").inputSchema);
    assert.equal(schema.safeParse({ title: "a".repeat(101), description: "ok" }).success, false);
    assert.equal(schema.safeParse({ title: "ok", description: "ok" }).success, true);
  });

  it("vote_feature rejects a vote value outside {1, -1, 0}", () => {
    const schema = z.object(findTool("vote_feature").inputSchema);
    assert.equal(schema.safeParse({ id: "f1", value: 2 }).success, false);
    assert.equal(schema.safeParse({ id: "f1", value: 1 }).success, true);
  });

  it("create_bug rejects an invalid severity", () => {
    const schema = z.object(findTool("create_bug").inputSchema);
    assert.equal(schema.safeParse({ title: "t", description: "d", severity: "urgent" }).success, false);
    assert.equal(schema.safeParse({ title: "t", description: "d", severity: "high" }).success, true);
  });

  it("run_org requires at least one file and rejects more than 10", () => {
    const schema = z.object(findTool("run_org").inputSchema);
    assert.equal(schema.safeParse({ id: "o1", files: [] }).success, false);
    assert.equal(
      schema.safeParse({ id: "o1", files: Array.from({ length: 11 }, (_, i) => ({ filename: `f${i}.md`, content: "x" })) })
        .success,
      false,
    );
    assert.equal(schema.safeParse({ id: "o1", files: [{ filename: "notes.md", content: "# hi" }] }).success, true);
  });
});

describe("call() wiring", () => {
  it("get_feed succeeds without authentication (community:read has no hard auth requirement)", async () => {
    const result = await findTool("get_feed").call({}, null);
    assert.notEqual(result.isError, true);
  });

  it("create_post without an Authorization header maps the REST 401 into isError with the same message", async () => {
    const result = await findTool("create_post").call({ title: "Hi", body: "Body" }, null);
    assert.equal(result.isError, true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    assert.match(text, /Not authenticated/);
  });

  it("vote_bug without authentication maps the REST 401 the same way", async () => {
    const result = await findTool("vote_bug").call({ id: "b1", value: 1 }, null);
    assert.equal(result.isError, true);
  });

  it("run_org without authentication maps the REST 401 the same way", async () => {
    const result = await findTool("run_org").call({ id: "o1", files: [{ filename: "a.md", content: "x" }] }, null);
    assert.equal(result.isError, true);
  });
});
