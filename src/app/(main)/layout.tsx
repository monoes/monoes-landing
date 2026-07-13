import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ivory font-sans text-gold-bronze antialiased">
      <GrainOverlay />
      <ScrollProgress />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
