"use client";

import { createAuthClient } from "better-auth/react";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [
    oauthProviderClient(),
    oneTapClient({ clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "" }),
  ],
});
