import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "./render-markdown.ts";

describe("renderMarkdown", () => {
  it("converts a heading to an <h1> tag", () => {
    const html = renderMarkdown("# Hello world");
    assert.match(html, /<h1[^>]*>Hello world<\/h1>/);
  });

  it("converts a code block to a <pre><code> block", () => {
    const html = renderMarkdown("```\nconst x = 1;\n```");
    assert.match(html, /<pre>/);
    assert.match(html, /<code>/);
  });

  it("strips a raw <script> tag embedded in the markdown source", () => {
    const html = renderMarkdown("# Title\n<script>alert('xss')</script>\nBody text.");
    assert.doesNotMatch(html, /<script/i);
    assert.match(html, /Body text/);
  });

  it("strips an inline event handler attribute", () => {
    const html = renderMarkdown('<img src="x.png" onerror="alert(1)">');
    assert.doesNotMatch(html, /onerror/i);
  });
});
