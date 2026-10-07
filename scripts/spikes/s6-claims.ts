// S6: what do real tokens look like, with and without `resource`?
//   npx tsx scripts/spikes/s6-claims.ts
import { AUDIENCE, decodeJwt, login, type Result } from "../../tests/helpers/oauth-api";

const base = process.env.SPIKE_BASE_URL ?? "http://localhost:3107";

// Structure only: claim names, shapes, the public identifiers. No token value is printed.
function describe(label: string, token: string | undefined) {
  if (!token?.includes(".")) return console.log(`${label}: ${token ? `opaque, ${token.length} characters` : "absent"}`);
  const { header, payload } = decodeJwt(token);
  const aud = payload.aud;
  console.log(`${label}: JWT header=${JSON.stringify(header)}`);
  console.log(`  iss=${payload.iss}  aud(${Array.isArray(aud) ? "array" : typeof aud})=${JSON.stringify(aud)}`);
  if (payload.azp) console.log(`  azp=${payload.azp} client_id=${payload.client_id} scope="${payload.scope}" plan=${payload.plan}`);
  console.log(`  exp-iat=${(payload.exp as number) - (payload.iat as number)} claims=${Object.keys(payload).sort().join(",")}`);
}

function show(title: string, r: Result) {
  console.log(`== ${title}: status ${r.status}${r.body.error ? ` ${r.body.error}: ${r.body.error_description}` : ""}, expires_in ${r.body.expires_in}, refresh token ${r.body.refresh_token ? "issued" : "absent"}`);
  describe("access", r.body.access_token);
  describe("id", r.body.id_token);
}

async function main() {
  show("no resource (today's client)", await login(base));
  show("resource sent on authorize and on the token request", await login(base, { resource: AUDIENCE }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
