import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export function renderMarkdown(source: string): string {
  const rawHtml = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml);
}
