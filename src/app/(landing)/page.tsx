import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Trace } from "@/components/home/Trace";
import { Roster } from "@/components/home/Roster";
import { Where } from "@/components/home/Where";
import { Path } from "@/components/home/Path";
import { Hire } from "@/components/home/Hire";
import { Close } from "@/components/home/Close";

export const metadata: Metadata = {
  description:
    "Mono Agent automates the workflows. Monomind orchestrates the company that builds everything else. Self-host both for $0 under Apache-2.0 and MIT, or hire Monoes Workforce to run it for your business.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Trace />
      <Roster />
      <Where />
      <Path />
      <Hire />
      <Close />
    </>
  );
}
