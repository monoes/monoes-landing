const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-.]+)?$/;

export function isSemver(value: string): boolean {
  return value.length <= 64 && SEMVER.test(value);
}

/** Negative when a < b, 0 when equal (build metadata ignored), positive when a > b. */
export function compareSemver(a: string, b: string): number {
  const ma = SEMVER.exec(a);
  const mb = SEMVER.exec(b);
  if (!ma || !mb) throw new Error(`not a semver version: ${ma ? b : a}`);
  for (let i = 1; i <= 3; i++) {
    const d = Number(ma[i]) - Number(mb[i]);
    if (d !== 0) return d;
  }
  const pa = ma[4];
  const pb = mb[4];
  if (pa === pb) return 0;
  if (pa === undefined) return 1; // 1.0.0 > 1.0.0-beta
  if (pb === undefined) return -1;
  const xa = pa.split(".");
  const xb = pb.split(".");
  for (let i = 0; i < Math.max(xa.length, xb.length); i++) {
    if (xa[i] === undefined) return -1;
    if (xb[i] === undefined) return 1;
    const na = /^\d+$/.test(xa[i]);
    const nb = /^\d+$/.test(xb[i]);
    if (na && nb) {
      const d = Number(xa[i]) - Number(xb[i]);
      if (d !== 0) return d;
    } else if (na !== nb) {
      return na ? -1 : 1;
    } else if (xa[i] !== xb[i]) {
      return xa[i] < xb[i] ? -1 : 1;
    }
  }
  return 0;
}

/** 1.4.2 → 1.4.3; 1.4.2-beta → 1.4.2. */
export function bumpPatch(version: string): string {
  const m = SEMVER.exec(version);
  if (!m) return "1.0.0";
  if (m[4] !== undefined) return `${m[1]}.${m[2]}.${m[3]}`;
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
}
