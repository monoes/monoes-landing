import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

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
    if (specifier === "./tools") return next("./tools.ts", context);
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

const { buildMcpServer } = await import("./build-server.ts");

describe("buildMcpServer", () => {
  it("registers all 11 tools, each connected to a working callback", () => {
    const server = buildMcpServer(null);
    const registered = (server as unknown as { _registeredTools: Record<string, { handler: unknown }> })
      ._registeredTools;
    const names = Object.keys(registered);
    assert.equal(names.length, 11);
    assert.ok(names.includes("get_feed"));
    assert.ok(names.includes("create_post"));
    for (const name of names) {
      assert.equal(typeof registered[name].handler, "function");
    }
  });
});
