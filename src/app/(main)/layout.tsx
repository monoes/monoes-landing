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
    <div className="min-h-screen bg-espresso font-sans text-ivory antialiased selection:bg-gold/25 selection:text-ivory">
      <GrainOverlay />
      <ScrollProgress />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
