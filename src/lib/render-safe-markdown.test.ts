import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderSafeMarkdown } from "./render-safe-markdown.ts";

describe("renderSafeMarkdown", () => {
  it("renders ordinary Markdown", () => {
    const html = renderSafeMarkdown("## Fixes\n\n- **bold** item\n\n`code`");
    assert.match(html, /<h2[^>]*>Fixes<\/h2>/);
    assert.match(html, /<strong>bold<\/strong>/);
    assert.match(html, /<code>code<\/code>/);
  });

  it("escapes raw HTML blocks and inline tags", () => {
    const html = renderSafeMarkdown("<script>alert(1)</script>\n\ntext <img src=x onerror=alert(1)>");
    assert.doesNotMatch(html, /<script/);
    assert.doesNotMatch(html, /<img src=x/);
    assert.match(html, /&lt;script&gt;/);
  });

  it("keeps safe links and drops javascript: URLs", () => {
    assert.match(renderSafeMarkdown("[ok](https://github.com/monoes)"), /<a href="https:\/\/github.com\/monoes" rel="noopener noreferrer">ok<\/a>/);
    const bad = renderSafeMarkdown("[click](javascript:alert(1)) ![x](javascript:alert(2))");
    assert.doesNotMatch(bad, /javascript:/);
    assert.match(bad, /click/);
  });
});
