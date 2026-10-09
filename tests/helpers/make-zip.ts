// Builds small zip archives (deflate or stored) for tests: .mpkg fixtures
// shaped like `monoagentcli automation pack` output.
import { crc32, deflateRawSync } from "node:zlib";

export function makeZip(files: Record<string, string | Uint8Array>, method: 0 | 8 = 8): Uint8Array {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.from(typeof content === "string" ? Buffer.from(content) : content);
    const packed = method === 8 ? deflateRawSync(data) : data;
    const nameBuf = Buffer.from(name);
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, packed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += 30 + nameBuf.length + packed.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(Object.keys(files).length, 8);
  eocd.writeUInt16LE(Object.keys(files).length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

export function automationManifest(overrides: Record<string, unknown> = {}) {
  return {
    schema: "monoagent.automation/v1",
    id: "demo-site",
    name: "Demo Site",
    version: "1.0.0",
    description: "Reads the demo site",
    publisher: { name: "Tester" },
    engine: ">=0.70.0",
    site: { startUrl: "https://demo.example/", domains: ["demo.example"] },
    permissions: { steps: ["log"], scripts: [], downloads: false },
    requires: { native: "demo" },
    actions: ["read_page", "like_post"],
    policy: { tier: "social" },
    ...overrides,
  };
}

/** An .mpkg: CHECKSUMS, automation.json and one action file. */
export function makeMpkg(overrides: Record<string, unknown> = {}): Uint8Array {
  return makeZip({
    CHECKSUMS: "",
    "automation.json": JSON.stringify(automationManifest(overrides)),
    "actions/read_page.json": JSON.stringify({ steps: [] }),
  });
}
