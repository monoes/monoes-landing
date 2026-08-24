"use client";

import { useEffect } from "react";
import { registerWebMcpTools } from "@/lib/webmcp/register-tools";

/** Renders nothing — just registers WebMCP tools on mount, site-wide. */
export function WebMcpRegistration() {
  useEffect(() => {
    registerWebMcpTools();
  }, []);

  return null;
}
