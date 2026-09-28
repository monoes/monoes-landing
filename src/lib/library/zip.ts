// A minimal zip reader: enough to pull automation.json out of a .mpkg
// (`monoagentcli automation pack` writes a plain deflate zip). Runs on
// Workers and Node alike (DataView + DecompressionStream, no dependencies).

const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;

export class ZipError extends Error {}

export interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  size: number;
  localHeaderOffset: number;
  encrypted: boolean;
}

function findEndOfCentralDirectory(view: DataView): number {
  // The EOCD record is 22 bytes plus an up-to-65535-byte comment.
  const min = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let i = view.byteLength - 22; i >= min; i--) {
    if (view.getUint32(i, true) === EOCD_SIG) return i;
  }
  throw new ZipError("not a zip archive");
}

export function listZipEntries(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 22) throw new ZipError("not a zip archive");
  const eocd = findEndOfCentralDirectory(view);
  const count = view.getUint16(eocd + 10, true);
  const cdOffset = view.getUint32(eocd + 16, true);
  if (count === 0xffff || cdOffset === 0xffffffff) throw new ZipError("zip64 archives are not supported");

  const decoder = new TextDecoder();
  const entries: ZipEntry[] = [];
  let p = cdOffset;
  for (let i = 0; i < count; i++) {
    if (p + 46 > bytes.byteLength || view.getUint32(p, true) !== CENTRAL_SIG) {
      throw new ZipError("corrupt zip central directory");
    }
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    if (p + 46 + nameLen > bytes.byteLength) throw new ZipError("corrupt zip central directory");
    entries.push({
      name: decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen)),
      method: view.getUint16(p + 10, true),
      encrypted: (view.getUint16(p + 8, true) & 1) === 1,
      compressedSize: view.getUint32(p + 20, true),
      size: view.getUint32(p + 24, true),
      localHeaderOffset: view.getUint32(p + 42, true),
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function inflateRaw(data: Uint8Array, maxBytes: number): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    let result: ReadableStreamReadResult<Uint8Array>;
    try {
      result = await reader.read();
    } catch {
      throw new ZipError("corrupt deflate data");
    }
    if (result.done) break;
    total += result.value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new ZipError(`entry is larger than ${maxBytes} bytes`);
    }
    chunks.push(result.value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

/** The bytes of entry `name`, or null when the archive has no such entry. */
export async function readZipEntry(bytes: Uint8Array, name: string, maxBytes: number): Promise<Uint8Array | null> {
  const entry = listZipEntries(bytes).find((e) => e.name === name);
  if (!entry) return null;
  if (entry.encrypted) throw new ZipError(`${name} is encrypted`);
  if (entry.size > maxBytes) throw new ZipError(`${name} is larger than ${maxBytes} bytes`);

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const lh = entry.localHeaderOffset;
  if (lh + 30 > bytes.byteLength || view.getUint32(lh, true) !== LOCAL_SIG) {
    throw new ZipError("corrupt zip local header");
  }
  const start = lh + 30 + view.getUint16(lh + 26, true) + view.getUint16(lh + 28, true);
  const end = start + entry.compressedSize;
  if (end > bytes.byteLength) throw new ZipError("truncated zip entry");
  const data = bytes.subarray(start, end);

  if (entry.method === 0) return data.slice();
  if (entry.method === 8) return inflateRaw(data, maxBytes);
  throw new ZipError(`unsupported zip compression method ${entry.method}`);
}
