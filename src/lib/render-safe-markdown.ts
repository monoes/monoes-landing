import { Marked } from "marked";

// DOM-free Markdown rendering for server code that runs in Cloudflare Workers,
// where isomorphic-dompurify's jsdom cannot load. Raw HTML in the source is
// escaped rather than sanitized, and only safe URL schemes survive in links
// and images.

const SAFE_URL = /^(https?:|mailto:|\/|#|\.{0,2}\/)/i;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeUrl(href: string): string | null {
  const trimmed = href.trim();
  return SAFE_URL.test(trimmed) ? escapeHtml(trimmed) : null;
}

const safeMarked = new Marked({
  async: false,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const url = safeUrl(href);
      if (!url) return text;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${url}"${titleAttr} rel="noopener noreferrer">${text}</a>`;
    },
    image({ href, title, text }) {
      const url = safeUrl(href);
      if (!url) return escapeHtml(text);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${url}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy">`;
    },
  },
});

export function renderSafeMarkdown(source: string): string {
  return safeMarked.parse(source) as string;
}
