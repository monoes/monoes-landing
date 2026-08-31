import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = { title: "Quickstart" };

export default function QuickstartPage() {
  return (
    <div className="max-w-[70ch]">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gold-dark">Quickstart</p>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-espresso">
        Add &quot;Connect to monoes&quot; to your site
      </h1>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        A worked example in JavaScript. See{" "}
        <Link href="/docs/authentication" className="text-gold-dark hover:underline">
          Authentication
        </Link>{" "}
        for the full flow reference.
      </p>

      <h2 className="mb-3 mt-10 text-lg font-semibold text-espresso">1. Register your client once</h2>
      <CodeBlock
        label="register-client.js"
        code={`const res = await fetch("https://monoes.me/api/auth/oauth2/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    redirect_uris: ["https://your-app.example/callback"],
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
  }),
});
const { client_id } = await res.json();
// Save client_id — you only need to do this once per app.`}
      />

      <h2 className="mb-3 mt-10 text-lg font-semibold text-espresso">2. Build the &quot;Connect&quot; link</h2>
      <p className="text-[15px] leading-relaxed text-espresso/75">
        Generate a PKCE code verifier/challenge pair, stash the verifier (session, cookie), and send the user to
        the authorize URL.
      </p>
      <CodeBlock
        label="connect-button.js"
        code={`function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
}

const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(
  await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
);
sessionStorage.setItem("pkce_verifier", verifier);

const url = new URL("https://monoes.me/api/auth/oauth2/authorize");
url.searchParams.set("client_id", CLIENT_ID);
url.searchParams.set("redirect_uri", "https://your-app.example/callback");
url.searchParams.set("response_type", "code");
url.searchParams.set("scope", "community:read community:write");
url.searchParams.set("code_challenge", challenge);
url.searchParams.set("code_challenge_method", "S256");

window.location.href = url.toString();`}
      />

      <h2 className="mb-3 mt-10 text-lg font-semibold text-espresso">3. Handle the callback</h2>
      <CodeBlock
        label="callback.js"
        code={`const code = new URL(window.location.href).searchParams.get("code");
const verifier = sessionStorage.getItem("pkce_verifier");

const res = await fetch("https://monoes.me/api/auth/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: "https://your-app.example/callback",
    client_id: CLIENT_ID,
    code_verifier: verifier,
  }),
});
const { access_token, refresh_token } = await res.json();
// Store access_token server-side, tied to your own user session.
// It's a bearer credential — treat it like a password.`}
      />

      <h2 className="mb-3 mt-10 text-lg font-semibold text-espresso">4. Call the API</h2>
      <CodeBlock
        label="whoami.js"
        code={`const me = await fetch("https://monoes.me/api/community/me", {
  headers: { Authorization: \`Bearer \${access_token}\` },
}).then((r) => r.json());

// { id, username, name, avatarUrl }`}
      />

      <p className="mt-8 text-sm text-espresso/60">
        No browser available? See the{" "}
        <Link href="/docs/authentication#headless-agents-no-browser" className="text-gold-dark hover:underline">
          headless agent flow
        </Link>{" "}
        instead. Full endpoint list: <Link href="/docs/reference" className="text-gold-dark hover:underline">API reference</Link>.
      </p>
    </div>
  );
}
