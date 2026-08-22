const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "Monoes Community API",
    version: "1.0.0",
    description: "REST API backing the monoes.me community: features, bugs, orgs, posts, and voting.",
  },
  servers: [{ url: "https://monoes.me/api/community" }],
  paths: {
    "/feed": {
      get: {
        summary: "List unified activity feed items (posts, bugs, orgs)",
        parameters: [
          { name: "sort", in: "query", schema: { type: "string", enum: ["latest", "popular"] } },
          { name: "page", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Feed items" } },
      },
    },
    "/features": {
      post: {
        summary: "Submit a feature request",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description"],
                properties: { title: { type: "string" }, description: { type: "string" } },
              },
            },
          },
        },
        responses: { "201": { description: "Feature created" }, "401": { description: "Not authenticated" } },
      },
    },
    "/features/{id}/vote": {
      post: {
        summary: "Vote on a feature",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["value"], properties: { value: { type: "integer", enum: [1, -1, 0] } } },
            },
          },
        },
        responses: { "200": { description: "Updated score" } },
      },
    },
    "/bugs": {
      post: {
        summary: "File a bug report",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Bug created" }, "401": { description: "Not authenticated" } },
      },
    },
    "/bugs/{id}/vote": {
      post: {
        summary: "Vote on a bug report",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["value"], properties: { value: { type: "integer", enum: [1, -1, 0] } } },
            },
          },
        },
        responses: { "200": { description: "Updated score" } },
      },
    },
    "/bugs/{id}/comments": {
      post: {
        summary: "Comment on a bug report",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Comment created" } },
      },
    },
    "/orgs": {
      post: {
        summary: "Upload an org definition",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Org uploaded" }, "401": { description: "Not authenticated" } },
      },
    },
    "/orgs/{id}/vote": {
      post: {
        summary: "Vote on an org upload",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["value"], properties: { value: { type: "integer", enum: [1, -1, 0] } } },
            },
          },
        },
        responses: { "200": { description: "Updated score" } },
      },
    },
    "/orgs/{id}/runs": {
      post: {
        summary: "Upload a run's output files (.md, .html) for an org",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  files: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Run created" } },
      },
    },
    "/posts": {
      post: {
        summary: "Create a community post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "body"],
                properties: { title: { type: "string" }, body: { type: "string" } },
              },
            },
          },
        },
        responses: { "201": { description: "Post created" }, "401": { description: "Not authenticated" } },
      },
    },
    "/posts/{id}/vote": {
      post: {
        summary: "Vote on a post",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["value"], properties: { value: { type: "integer", enum: [1, -1, 0] } } },
            },
          },
        },
        responses: { "200": { description: "Updated score" } },
      },
    },
  },
};

export function GET() {
  return Response.json(SPEC);
}
