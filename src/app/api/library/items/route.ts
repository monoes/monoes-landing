import { errorResponse } from "@/lib/library/http";
import { handleCreate, handleList } from "@/lib/library/handlers";

export async function GET(request: Request) {
  try {
    return await handleList(request);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    return await handleCreate(request);
  } catch (err) {
    return errorResponse(err);
  }
}
