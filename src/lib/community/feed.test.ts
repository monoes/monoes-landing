import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/db") {
      return { url: "data:text/javascript,export const getDb = () => ({});", shortCircuit: true };
    }
    if (specifier === "@/lib/db/schema") {
      return { url: "data:text/javascript,export const post = {}; export const postVote = {}; export const bug = {}; export const bugVote = {}; export const feature = {}; export const featureVote = {}; export const orgUpload = {}; export const orgVote = {}; export const user = {};", shortCircuit: true };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { parseSort, parsePage, sortAndPaginate } = await import("./feed.ts");
type FeedItem = import("./feed.ts").FeedItem;

function item(overrides: Partial<FeedItem>): FeedItem {
  return {
    id: "id",
    type: "post",
    title: "title",
    preview: "preview",
    authorId: "author",
    authorUsername: "author",
    createdAt: new Date().toISOString(),
    score: 0,
    myVote: 0,
    ...overrides,
  };
}

describe("parseSort", () => {
  it("returns 'popular' only for the exact string 'popular'", () => {
    assert.equal(parseSort("popular"), "popular");
    assert.equal(parseSort("latest"), "latest");
    assert.equal(parseSort(null), "latest");
    assert.equal(parseSort("bogus"), "latest");
  });
});

describe("parsePage", () => {
  it("clamps missing, negative, or non-numeric values to 0", () => {
    assert.equal(parsePage(null), 0);
    assert.equal(parsePage("-1"), 0);
    assert.equal(parsePage("abc"), 0);
    assert.equal(parsePage("0"), 0);
  });

  it("accepts valid positive integers", () => {
    assert.equal(parsePage("1"), 1);
    assert.equal(parsePage("5"), 5);
  });
});

describe("sortAndPaginate", () => {
  it("sorts by createdAt descending for 'latest'", () => {
    const older = item({ id: "older", createdAt: "2026-01-01T00:00:00.000Z" });
    const newer = item({ id: "newer", createdAt: "2026-01-02T00:00:00.000Z" });
    const { items } = sortAndPaginate([older, newer], "latest", 0);
    assert.deepEqual(items.map((i) => i.id), ["newer", "older"]);
  });

  it("sorts by score descending, then createdAt descending, for 'popular'", () => {
    const lowScore = item({ id: "low", score: 1, createdAt: "2026-01-02T00:00:00.000Z" });
    const highScore = item({ id: "high", score: 5, createdAt: "2026-01-01T00:00:00.000Z" });
    const { items } = sortAndPaginate([lowScore, highScore], "popular", 0);
    assert.deepEqual(items.map((i) => i.id), ["high", "low"]);
  });

  it("paginates in pages of 20 and reports hasMore correctly", () => {
    const items = Array.from({ length: 25 }, (_, i) =>
      item({ id: `item-${i}`, createdAt: new Date(2026, 0, i + 1).toISOString() }),
    );
    const page0 = sortAndPaginate(items, "latest", 0);
    assert.equal(page0.items.length, 20);
    assert.equal(page0.hasMore, true);

    const page1 = sortAndPaginate(items, "latest", 1);
    assert.equal(page1.items.length, 5);
    assert.equal(page1.hasMore, false);
  });
});
