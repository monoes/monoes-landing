import { CommunityShell } from "@/components/community/nav/CommunityShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CommunityShell>{children}</CommunityShell>;
}
