"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function GoogleOneTapPrompt({ context }: { context: "signin" | "signup" }) {
  useEffect(() => {
    authClient.oneTap({ autoSelect: true, context, callbackURL: "/community" });
  }, [context]);

  return null;
}
