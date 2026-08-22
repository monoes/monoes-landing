const BODY = `User-Agent: *
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=no

Host: https://monoes.me
Sitemap: https://monoes.me/sitemap.xml
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain" },
  });
}
