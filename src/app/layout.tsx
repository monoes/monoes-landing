import type { Metadata } from "next";
import { satoshi, jetbrainsMono } from "@/lib/fonts";
import { Analytics } from "@/components/Analytics";
import { WebMcpRegistration } from "@/components/WebMcpRegistration";
import { SOCIAL_LINKS } from "@/lib/social-links";
import "@/styles/globals.css";

const SITE_URL = "https://monoes.me";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Monoes: Open-source AI agents you run yourself or hire us to run",
    template: "%s · Monoes",
  },
  description:
    "One engine, two paths. Run Monomind, Mono Agent, MonoClip, and MonoTask yourself for free - or hire Monoes Workforce to deploy AI digital workers that run your real business processes end-to-end.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Monoes",
    title: "Monoes: Open-source AI agents you run yourself or hire us to run",
    description:
      "Run four AI tools yourself for free, or hire Monoes Workforce to automate your business processes end-to-end.",
    images: [{ url: "/images/logo-512.png", width: 512, height: 512, alt: "Monoes" }],
  },
  twitter: {
    card: "summary",
    site: "@monoes_me",
    title: "Monoes",
    description: "Open-source AI agents you run yourself, or hire us to run.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Monoes",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-512.png`,
  description:
    "Monoes builds AI agent tools (open-source Monomind, MonoClip and MonoTask, and Mono Agent, free of charge) and runs Monoes Workforce, a managed service that deploys AI digital workers to automate business processes end-to-end on the ERP, CRM and email systems a company already uses.",
  sameAs: SOCIAL_LINKS.map((link) => link.href),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${satoshi.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <WebMcpRegistration />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
