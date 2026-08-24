export type RouteResult = { status: number; body: unknown };

type JsonRouteHandler =
  | ((request: Request) => Promise<Response>)
  | ((request: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>);

/**
 * Builds a synthetic Request matching what a /api/community/* route handler
 * expects, calls it directly, and parses the JSON response. This is the
 * entire "MCP -> REST" bridge for JSON-body routes: no business logic,
 * validation, or auth check is reimplemented here — it all lives in the
 * route handler this calls.
 */
export async function callJsonRoute(
  handler: JsonRouteHandler,
  opts: {
    method: string;
    url: string;
    authHeader: string | null;
    json?: unknown;
    params?: Record<string, string>;
  },
): Promise<RouteResult> {
  const headers = new Headers();
  if (opts.authHeader) headers.set("authorization", opts.authHeader);
  if (opts.json !== undefined) headers.set("content-type", "application/json");

  const request = new Request(opts.url, {
    method: opts.method,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : undefined,
  });

  const response = opts.params
    ? await (handler as (request: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>)(
        request,
        { params: Promise.resolve(opts.params) },
      )
    : await (handler as (request: Request) => Promise<Response>)(request);

  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

type FormRouteHandler = (
  request: Request,
  ctx: { params: Promise<Record<string, string>> },
) => Promise<Response>;

/**
 * Same bridge as callJsonRoute, for the one route (run_org) that takes
 * multipart form data instead of a JSON body.
 */
export async function callFormRoute(
  handler: FormRouteHandler,
  opts: {
    url: string;
    authHeader: string | null;
    fields: Record<string, string>;
    files: Array<{ fieldName: string; filename: string; content: string; mimeType: string }>;
    params: Record<string, string>;
  },
): Promise<RouteResult> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(opts.fields)) {
    formData.append(key, value);
  }
  for (const file of opts.files) {
    formData.append(file.fieldName, new File([file.content], file.filename, { type: file.mimeType }));
  }

  const headers = new Headers();
  if (opts.authHeader) headers.set("authorization", opts.authHeader);

  const request = new Request(opts.url, { method: "POST", headers, body: formData });
  const response = await handler(request, { params: Promise.resolve(opts.params) });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}
