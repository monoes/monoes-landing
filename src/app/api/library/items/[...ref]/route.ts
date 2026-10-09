import { apiError, errorResponse, parseItemPath, type ItemPath } from "@/lib/library/http";
import { handleDelete, handleGet, handleNewVersion, handlePatch } from "@/lib/library/handlers";

type Ctx = { params: Promise<{ ref: string[] }> };

// /api/library/items/{id} | {id}/artifact | {id}/versions, and the same under {kind}/{slug}.
function route(handler: (request: Request, path: ItemPath) => Promise<Response>) {
  return async (request: Request, ctx: Ctx) => {
    const { ref } = await ctx.params;
    const path = parseItemPath(ref);
    if (!path) return apiError(404, "not_found", "No such library endpoint.");
    try {
      return await handler(request, path);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export const GET = route(handleGet);
export const PUT = route(handleNewVersion);
export const PATCH = route(handlePatch);
export const DELETE = route(handleDelete);
