import type { Metadata } from "next";
import { satoshi, jetbrainsMono } from "@/lib/fonts";
import "@/styles/globals.css";

const SITE_URL = "https://monoes.me";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Monoes: Open-source AI agents you run yourself or hire us to run",
    template: "%s · Monoes",
  },
  description:
    "One engine, two paths. Self-host Monomind, Mono Agent, MonoClip, and MonoTask for free under Apache-2.0 — or hire Monoes Workforce to deploy AI digital workers that run your real business processes end-to-end.",
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
      "Self-host four open-source AI tools for free, or hire Monoes Workforce to automate your business processes end-to-end.",
    images: [{ url: "/images/logo-512.png", width: 512, height: 512, alt: "Monoes" }],
  },
  twitter: {
    card: "summary",
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
    "Open-source AI agent tooling (Monomind, Mono Agent, MonoClip, MonoTask) and a paid Workforce service that automates business processes end-to-end.",
  sameAs: ["https://github.com/monoes"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </body>
    </html>
  );
}
