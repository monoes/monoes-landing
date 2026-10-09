import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatDateTime } from "./format-date.ts";

describe("formatDate", () => {
  it("formats in English and UTC regardless of the runtime's locale and zone", () => {
    // 23:30 UTC is already the next day in Berlin; the output must still be the UTC day.
    assert.equal(formatDate("2026-09-28T23:30:00Z"), "Sep 28, 2026");
    assert.match(formatDateTime("2026-09-28T23:30:00Z"), /^Sep 28, 2026, 11:30\sPM UTC$/);
  });
});
