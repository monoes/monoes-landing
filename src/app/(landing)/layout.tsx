import { SmoothScroll } from "@/components/home/SmoothScroll";
import { PageMotion } from "@/components/home/PageMotion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/home/Footer";
import "lenis/dist/lenis.css";
import "@/styles/home-base.css";
import "@/styles/home-hero.css";
import "@/styles/home-sections.css";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp">
      <SmoothScroll />
      <PageMotion />
      <a className="lp-skip" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
