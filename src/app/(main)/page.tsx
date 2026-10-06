import type { Metadata } from "next";
import { HomeHero } from "@/components/landing/HomeHero";
import { HomeProofStrip } from "@/components/landing/HomeProofStrip";
import { HomeHowItWorks } from "@/components/landing/HomeHowItWorks";
import { HomeCapabilities } from "@/components/landing/HomeCapabilities";
import { HomeUseCases } from "@/components/landing/HomeUseCases";
import { HomeProofTeaser } from "@/components/landing/HomeProofTeaser";
import { HomeSecurity } from "@/components/landing/HomeSecurity";
import { HomeTransparency } from "@/components/landing/HomeTransparency";
import { HomePlans } from "@/components/landing/HomePlans";
import { HomeFaq } from "@/components/landing/HomeFaq";
import { HomeClose } from "@/components/landing/HomeClose";

export const metadata: Metadata = {
  description:
    "Mono Agent automates the workflows. Monomind orchestrates the company that builds everything else. Self-host both for $0 under Apache-2.0 and MIT, or hire Monoes Workforce to run it for your business.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeProofStrip />
      <HomeHowItWorks />
      <HomeCapabilities />
      <HomeUseCases />
      <HomeProofTeaser />
      <HomeSecurity />
      <HomeTransparency />
      <HomePlans />
      <HomeFaq />
      <HomeClose />
    </>
  );
}
