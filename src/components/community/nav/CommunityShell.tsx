"use client";

import { usePathname } from "next/navigation";
import { CommunityNav } from "./CommunityNav";

// Sign-in and onboarding screens stay focused: no section menu.
const BARE_PREFIXES = [
  "/community/login",
  "/community/register",
  "/community/forgot-password",
  "/community/reset-password",
  "/community/onboarding",
  "/community/oauth",
];

/**
 * Wraps community and library pages with the section menu. The menu sits
 * under the fixed site navbar, so the page below it needs less top padding
 * than its own pt-24 (which assumed nothing between it and the navbar).
 */
export function CommunityShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (BARE_PREFIXES.some((p) => pathname.startsWith(p))) return <>{children}</>;
  return (
    <div className="bg-ivory-warm pt-[69px]">
      <CommunityNav pathname={pathname} />
      <div className="[&>main]:pt-10 sm:[&>main]:pt-12">{children}</div>
    </div>
  );
}
