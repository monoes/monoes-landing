/**
 * The page to return to after logging in, from a `?next=` value. Only a
 * same-site path is accepted ("/library/x?y=1"); anything else (absolute or
 * protocol-relative URLs, backslash tricks) falls back to /community, so the
 * login page can't be used as an open redirect.
 */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/community";
  if (/[\u0000-\u001f]/.test(value)) return "/community";
  return value;
}

/** /community/login?next=<path+query> for a page the visitor was sent away from. */
export function loginUrlFor(pathWithQuery: string): string {
  return `/community/login?next=${encodeURIComponent(pathWithQuery)}`;
}
