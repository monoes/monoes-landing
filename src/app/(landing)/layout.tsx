import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monoes: Open-source AI agents you run yourself or hire us to run",
  description:
    "One engine, two paths. Self-host Monomind, Mono Agent, MonoClip, and MonoTask for free under Apache-2.0 - or hire Monoes Workforce to deploy AI digital workers that run your real business processes end-to-end.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://monoes.me",
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

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
