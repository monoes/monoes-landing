import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateApplication, AUDIENCE_LINES, MAX_PARALLEL_BUILDS } from "./build-first.ts";

const valid = {
  audience: "companies",
  line: "modernize",
  fullName: "Dana Example",
  email: "dana@example.com",
  role: "Head of Operations",
  organization: "Example GmbH",
  website: "https://example.com",
  country: "Germany",
  canSign: "yes",
  profile: "50-249",
  dealStructure: "cash",
  budgetRange: "50k-150k",
  description: "Move our 12-year-old PHP monolith to a modern stack without changing behaviour.",
  regulated: "no",
  commitment: true,
  consent: true,
};

describe("build first application validation", () => {
  it("accepts a complete company application", () => {
    assert.equal(validateApplication(valid).ok, true);
  });

  it("rejects non-objects and empty input", () => {
    assert.equal(validateApplication(null).ok, false);
    assert.equal(validateApplication({}).ok, false);
  });

  it("rejects an invalid email", () => {
    const r = validateApplication({ ...valid, email: "not-an-email" });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.fieldErrors.email);
  });

  it("requires consent and the availability commitment", () => {
    const r = validateApplication({ ...valid, consent: false, commitment: false });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.ok(r.fieldErrors.consent);
      assert.ok(r.fieldErrors.commitment);
    }
  });

  it("requires signer details when the applicant cannot sign", () => {
    const r = validateApplication({ ...valid, canSign: "no" });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.fieldErrors.signerContact);
    assert.equal(validateApplication({ ...valid, canSign: "no", signerContact: "Lee Boss, CEO" }).ok, true);
  });

  it("requires detail when a regulated domain is involved", () => {
    const r = validateApplication({ ...valid, regulated: "yes" });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.fieldErrors.regulatedDetail);
  });

  it("rejects a too-short description and a non-http website", () => {
    const r = validateApplication({ ...valid, description: "too short", website: "javascript:alert(1)" });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.ok(r.fieldErrors.description);
      assert.ok(r.fieldErrors.website);
    }
  });

  it("rejects equity deals and lines that the audience cannot choose", () => {
    assert.equal(validateApplication({ ...valid, dealStructure: "equity_only" }).ok, false);
    assert.equal(validateApplication({ ...valid, audience: "startups", line: "modernize", profile: "seed" }).ok, false);
  });

  it("accepts an equity-only startup application", () => {
    const r = validateApplication({
      ...valid,
      audience: "startups",
      line: "launch",
      profile: "idea",
      dealStructure: "equity_only",
      website: "",
    });
    assert.equal(r.ok, true);
  });

  it("keeps the line lists and the parallel-build limit stable", () => {
    assert.deepEqual([...AUDIENCE_LINES.startups], ["launch", "flow"]);
    assert.equal(MAX_PARALLEL_BUILDS, 100);
  });
});
