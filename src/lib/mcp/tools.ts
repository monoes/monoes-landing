import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { callJsonRoute, callFormRoute, type RouteResult } from "./call-route";

import { GET as getFeed } from "@/app/api/community/feed/route";
import { POST as createFeature } from "@/app/api/community/features/route";
import { POST as voteFeature } from "@/app/api/community/features/[id]/vote/route";
import { POST as createBug } from "@/app/api/community/bugs/route";
import { POST as voteBug } from "@/app/api/community/bugs/[id]/vote/route";
import { POST as commentBug } from "@/app/api/community/bugs/[id]/comments/route";
import { POST as createOrg } from "@/app/api/community/orgs/route";
import { POST as voteOrg } from "@/app/api/community/orgs/[id]/vote/route";
import { POST as runOrg } from "@/app/api/community/orgs/[id]/runs/route";
import { POST as createPost } from "@/app/api/community/posts/route";
import { POST as votePost } from "@/app/api/community/posts/[id]/vote/route";

const INTERNAL_ORIGIN = "http://mcp.internal";

const voteValueSchema = z.union([z.literal(1), z.literal(-1), z.literal(0)]);

export type ToolDefinition = {
  name: string;
  title: string;
  description: string;
  inputSchema: z.ZodRawShape;
  call: (args: Record<string, unknown>, authHeader: string | null) => Promise<CallToolResult>;
};

function toToolResult(result: RouteResult): CallToolResult {
  const text = JSON.stringify(result.body);
  if (result.status >= 200 && result.status < 300) {
    return { content: [{ type: "text", text }] };
  }
  const errorMessage =
    result.body && typeof result.body === "object" && "error" in result.body && typeof result.body.error === "string"
      ? result.body.error
      : `Request failed with status ${result.status}`;
  return { content: [{ type: "text", text: errorMessage }], isError: true };
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "get_feed",
    title: "Get community feed",
    description: "List recent community activity (features, bugs, posts, orgs), optionally sorted and paginated. No authentication required.",
    inputSchema: {
      sort: z.enum(["latest", "popular"]).optional(),
      page: z.number().int().positive().optional(),
      authorId: z.string().optional(),
    },
    call: async (args, authHeader) => {
      const url = new URL("/api/community/feed", INTERNAL_ORIGIN);
      if (typeof args.sort === "string") url.searchParams.set("sort", args.sort);
      if (typeof args.page === "number") url.searchParams.set("page", String(args.page));
      if (typeof args.authorId === "string") url.searchParams.set("authorId", args.authorId);
      const result = await callJsonRoute(getFeed, { method: "GET", url: url.toString(), authHeader });
      return toToolResult(result);
    },
  },
  {
    name: "create_feature",
    title: "Create feature request",
    description: "Submit a new feature request to the community. Requires write authentication.",
    inputSchema: {
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(1000),
    },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(createFeature, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/features`,
        authHeader,
        json: { title: args.title, description: args.description },
      });
      return toToolResult(result);
    },
  },
  {
    name: "vote_feature",
    title: "Vote on a feature request",
    description: "Upvote (1), downvote (-1), or clear a vote (0) on a feature request. Requires write authentication.",
    inputSchema: { id: z.string(), value: voteValueSchema },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(voteFeature, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/features/${args.id}/vote`,
        authHeader,
        json: { value: args.value },
        params: { id: String(args.id) },
      });
      return toToolResult(result);
    },
  },
  {
    name: "create_bug",
    title: "Report a bug",
    description: "File a new bug report. Requires write authentication.",
    inputSchema: {
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(1000),
      severity: z.enum(["low", "medium", "high", "critical"]),
    },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(createBug, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/bugs`,
        authHeader,
        json: { title: args.title, description: args.description, severity: args.severity },
      });
      return toToolResult(result);
    },
  },
  {
    name: "vote_bug",
    title: "Vote on a bug report",
    description: "Upvote (1), downvote (-1), or clear a vote (0) on a bug report. Requires write authentication.",
    inputSchema: { id: z.string(), value: voteValueSchema },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(voteBug, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/bugs/${args.id}/vote`,
        authHeader,
        json: { value: args.value },
        params: { id: String(args.id) },
      });
      return toToolResult(result);
    },
  },
  {
    name: "comment_bug",
    title: "Comment on a bug report",
    description: "Add a comment to an existing bug report. Requires write authentication.",
    inputSchema: { id: z.string(), body: z.string().min(1).max(1000) },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(commentBug, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/bugs/${args.id}/comments`,
        authHeader,
        json: { body: args.body },
        params: { id: String(args.id) },
      });
      return toToolResult(result);
    },
  },
  {
    name: "create_org",
    title: "Upload a monomind org",
    description: "Upload a monomind org definition (as a JSON document string) to the org gallery. Requires write authentication.",
    inputSchema: { orgJson: z.string().min(1) },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(createOrg, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/orgs`,
        authHeader,
        json: { orgJson: args.orgJson },
      });
      return toToolResult(result);
    },
  },
  {
    name: "vote_org",
    title: "Vote on an uploaded org",
    description: "Upvote (1), downvote (-1), or clear a vote (0) on an uploaded org. Requires write authentication.",
    inputSchema: { id: z.string(), value: voteValueSchema },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(voteOrg, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/orgs/${args.id}/vote`,
        authHeader,
        json: { value: args.value },
        params: { id: String(args.id) },
      });
      return toToolResult(result);
    },
  },
  {
    name: "run_org",
    title: "Attach a run to an uploaded org",
    description: "Attach one or more run output files (.md or .html, raw text content) to an uploaded org. Requires write authentication.",
    inputSchema: {
      id: z.string(),
      label: z.string().max(100).optional(),
      files: z
        .array(
          z.object({
            filename: z.string().min(1),
            content: z.string(),
          }),
        )
        .min(1)
        .max(10),
    },
    call: async (args, authHeader) => {
      const orgId = String(args.id);
      const files = args.files as Array<{ filename: string; content: string }>;
      const mimeType = (filename: string) => (filename.toLowerCase().endsWith(".html") ? "text/html" : "text/markdown");
      const result = await callFormRoute(runOrg, {
        url: `${INTERNAL_ORIGIN}/api/community/orgs/${orgId}/runs`,
        authHeader,
        fields: typeof args.label === "string" ? { label: args.label } : {},
        files: files.map((file) => ({
          fieldName: "files",
          filename: file.filename,
          content: file.content,
          mimeType: mimeType(file.filename),
        })),
        params: { id: orgId },
      });
      return toToolResult(result);
    },
  },
  {
    name: "create_post",
    title: "Create a forum post",
    description: "Create a new forum post. Requires write authentication.",
    inputSchema: {
      title: z.string().min(1).max(100),
      body: z.string().min(1).max(2000),
    },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(createPost, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/posts`,
        authHeader,
        json: { title: args.title, body: args.body },
      });
      return toToolResult(result);
    },
  },
  {
    name: "vote_post",
    title: "Vote on a forum post",
    description: "Upvote (1), downvote (-1), or clear a vote (0) on a forum post. Requires write authentication.",
    inputSchema: { id: z.string(), value: voteValueSchema },
    call: async (args, authHeader) => {
      const result = await callJsonRoute(votePost, {
        method: "POST",
        url: `${INTERNAL_ORIGIN}/api/community/posts/${args.id}/vote`,
        authHeader,
        json: { value: args.value },
        params: { id: String(args.id) },
      });
      return toToolResult(result);
    },
  },
];
