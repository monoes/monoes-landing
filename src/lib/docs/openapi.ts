import { ENDPOINT_GROUPS, type AuthRequirement, type Endpoint } from "./endpoint-registry";

const METHOD_KEY: Record<Endpoint["method"], string> = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
};

function pathParams(path: string): string[] {
  return Array.from(path.matchAll(/\{(\w+)\}/g)).map((m) => m[1]);
}

function securityFor(auth: AuthRequirement): { security?: unknown[]; authNote?: string } {
  if (auth.kind === "public") return { security: [] };
  if (auth.kind === "scope") return { security: [{ oauth2: [auth.scope] }] };
  return {
    security: [{ oauth2: [auth.scope] }],
    authNote: `Additionally requires the acting user to have the ${auth.roles.join(" or ")} role.`,
  };
}

function buildOperation(endpoint: Endpoint, groupName: string) {
  const { security, authNote } = securityFor(endpoint.auth);
  const description = [endpoint.notes, authNote].filter(Boolean).join(" ") || undefined;

  const operation: Record<string, unknown> = {
    summary: endpoint.summary,
    tags: [groupName],
    ...(description ? { description } : {}),
    ...(security ? { security } : {}),
  };

  const params = pathParams(endpoint.path).map((name) => ({
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
  }));
  if (params.length > 0) operation.parameters = params;

  if (endpoint.request) {
    operation.requestBody = {
      required: true,
      content: {
        [endpoint.requestType === "multipart" ? "multipart/form-data" : "application/json"]: {
          schema: { type: "object" },
          description: endpoint.request,
        },
      },
    };
  }

  operation.responses = {
    default: { description: endpoint.response ?? "See the docs site for the response shape." },
  };

  return operation;
}

export function buildOpenApiSpec() {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const group of ENDPOINT_GROUPS) {
    for (const endpoint of group.endpoints) {
      const relativePath = endpoint.path.replace(/^\/api/, "");
      paths[relativePath] ??= {};
      paths[relativePath][METHOD_KEY[endpoint.method]] = buildOperation(endpoint, group.name);
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Monoes API",
      version: "1.0.0",
      description:
        "REST API backing monoes.me: the community (features, bugs, orgs, posts, voting) and the MonoAgent library (workflows, web automations, orgs). Generated from the same registry that powers https://monoes.me/docs/reference.",
    },
    servers: [{ url: "https://monoes.me/api" }],
    security: [{ oauth2: ["community:read", "community:write"] }],
    components: {
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            authorizationCode: {
              authorizationUrl: "https://monoes.me/api/auth/oauth2/authorize",
              tokenUrl: "https://monoes.me/api/auth/oauth2/token",
              scopes: {
                "community:read": "Read feed, bugs, orgs, posts, and votes",
                "community:write": "Post, comment, vote, and upload",
                "library:read": "Read your library, including private items",
                "library:write": "Publish, update and delete library items",
              },
            },
          },
        },
      },
    },
    paths,
  };
}
