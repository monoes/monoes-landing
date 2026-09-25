import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OrgDefSchema } from "../org-schema.ts";
import {
  BODY_MAX,
  TAGLINE_MAX,
  buildOrgBody,
  deriveOrgListing,
  deriveTagline,
  humanizeOrgName,
  slugifyOrgName,
  uniqueSlug,
} from "./org-listing.ts";

const org = OrgDefSchema.parse({
  name: "content-team",
  goal: "Publish three posts a week. Research, draft and review each one.",
  roles: [
    { id: "lead", title: "Editor in Chief", type: "boss" },
    { id: "writer", title: "Writer", reports_to: "lead", responsibilities: ["Draft posts"] },
  ],
});

describe("org listing", () => {
  it("humanizes kebab-case names and keeps already-formatted ones", () => {
    assert.equal(humanizeOrgName("monomind-dev"), "Monomind Dev");
    assert.equal(humanizeOrgName("helix"), "Helix");
    assert.equal(humanizeOrgName("My Org"), "My Org");
  });

  it("slugifies and de-duplicates slugs", () => {
    assert.equal(slugifyOrgName("Café Team_v2"), "cafe-team-v2");
    assert.equal(slugifyOrgName("!!!"), "org");
    assert.equal(uniqueSlug("helix", ["helix", "helix-2"]), "helix-3");
    assert.equal(uniqueSlug("helix", []), "helix");
  });

  it("uses the first sentence as the tagline", () => {
    assert.equal(deriveTagline(org.goal), "Publish three posts a week.");
  });

  it("cuts a long first sentence at a clause boundary within the limit", () => {
    const goal = `Migrate one screen into the codebase through small, ordered checkpoints, each of which must pass four gates in order — behavior, UI review, code review and approval, with feedback remembered so later checkpoints need less oversight.`;
    const tagline = deriveTagline(goal);
    assert.ok(tagline && tagline.length <= TAGLINE_MAX);
    assert.equal(tagline, "Migrate one screen into the codebase through small, ordered checkpoints, each of which must pass four gates in order.");
  });

  it("derives every listing field from the org file", () => {
    const listing = deriveOrgListing(org, "hierarchical");
    assert.equal(listing.name, "Content Team");
    assert.equal(listing.slug, "content-team");
    assert.equal(listing.tagline, "Publish three posts a week.");
    assert.equal(listing.description, org.goal);
    assert.match(listing.body, /\| Writer \| specialist \| Editor in Chief \|/);
    assert.match(listing.body, /2 roles, hierarchical topology\./);
    assert.match(listing.body, /monomind org run content-team/);
    assert.doesNotMatch(listing.body, /## What this org does/);
  });

  it("keeps the body within the limit", () => {
    const big = OrgDefSchema.parse({
      name: "big",
      goal: "x ".repeat(3000),
      roles: Array.from({ length: 400 }, (_, i) => ({ id: `r${i}`, title: `Role number ${i} with a long title` })),
    });
    assert.ok(buildOrgBody(big, null).length <= BODY_MAX);
  });
});
