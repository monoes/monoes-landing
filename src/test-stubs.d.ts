// Globals the unit tests' module-resolution hooks read their stubbed
// dependencies from (e.g. `globalThis.__stubSession`). Test-only.
declare global {
  var __stubSession: unknown;
  var __stubUserRow: unknown;
  var __stubDb: () => unknown;
  var __stubCloudflareContext: () => unknown;
}

export {};
