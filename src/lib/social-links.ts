export type SocialLinkId =
  | "github"
  | "x"
  | "linkedin"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "hackernews"
  | "kofi"
  | "bluesky"
  | "reddit"
  | "mastodon";

export interface SocialLink {
  id: SocialLinkId;
  name: string;
  href: string;
  tier: "primary" | "secondary";
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: "github", name: "GitHub", href: "https://github.com/monoes/monomind", tier: "primary" },
  { id: "x", name: "X", href: "https://x.com/monoes_me", tier: "primary" },
  { id: "linkedin", name: "LinkedIn", href: "https://www.linkedin.com/company/135258453", tier: "primary" },
  { id: "youtube", name: "YouTube", href: "https://www.youtube.com/@monoes_me", tier: "primary" },
  { id: "instagram", name: "Instagram", href: "https://www.instagram.com/monoes.me_", tier: "primary" },
  { id: "tiktok", name: "TikTok", href: "https://www.tiktok.com/@monoes.me", tier: "primary" },
  { id: "hackernews", name: "Hacker News", href: "https://news.ycombinator.com/user?id=monoes", tier: "secondary" },
  { id: "kofi", name: "Ko-fi", href: "https://ko-fi.com/monoes", tier: "secondary" },
  { id: "bluesky", name: "Bluesky", href: "https://bsky.app/profile/monoes-me.bsky.social", tier: "secondary" },
  { id: "reddit", name: "Reddit", href: "https://www.reddit.com/user/Monoes_me/", tier: "secondary" },
  { id: "mastodon", name: "Mastodon", href: "https://mastodon.social/@monoes", tier: "secondary" },
];

export const PRIMARY_SOCIAL_LINKS = SOCIAL_LINKS.filter((link) => link.tier === "primary");
export const SECONDARY_SOCIAL_LINKS = SOCIAL_LINKS.filter((link) => link.tier === "secondary");
