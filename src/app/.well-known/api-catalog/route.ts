const CATALOG = {
  linkset: [
    {
      anchor: "https://monoes.me/api/community",
      "service-desc": [{ href: "https://monoes.me/api/openapi.json", type: "application/vnd.oai.openapi+json" }],
      "service-doc": [{ href: "https://monoes.me/community/api-docs", type: "text/html" }],
    },
  ],
};

export function GET() {
  return Response.json(CATALOG, {
    headers: { "Content-Type": "application/linkset+json" },
  });
}
