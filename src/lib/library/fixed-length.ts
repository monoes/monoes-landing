// Library artifact downloads promise a Content-Length (MonoAgent reads it for
// progress and a size check). On Cloudflare, OpenNext hands every response to
// workerd as a plain ReadableStream, so workerd can't know the length and
// sends it chunked, dropping the header. The route therefore also sends the
// length as X-Content-Length, and the Worker entry (src/worker.ts) re-streams
// such responses through workerd's FixedLengthStream, which makes workerd send
// a real Content-Length.

export const LENGTH_HINT_HEADER = "X-Content-Length";

type FixedLengthStreamCtor = new (length: number) => { readable: ReadableStream; writable: WritableStream };

/** `response` with a fixed-length body when it carries a length hint; otherwise unchanged. */
export function withFixedLength(response: Response, FixedLengthStream: FixedLengthStreamCtor | undefined): Response {
  const hint = response.headers.get(LENGTH_HINT_HEADER);
  if (hint === null || !response.body || !FixedLengthStream) return response;
  const length = Number(hint);
  if (!/^\d+$/.test(hint) || !Number.isSafeInteger(length)) return response;

  const { readable, writable } = new FixedLengthStream(length);
  // A length mismatch errors the stream; the client then sees a truncated
  // download, which the SHA-256 check rejects.
  response.body.pipeTo(writable).catch(() => {});
  const headers = new Headers(response.headers);
  headers.delete(LENGTH_HINT_HEADER);
  headers.delete("Content-Length");
  return new Response(readable, { status: response.status, statusText: response.statusText, headers });
}
