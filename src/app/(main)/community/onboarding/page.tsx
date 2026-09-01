import type { Metadata } from "next";
import { OnboardingForm } from "@/components/community/auth/OnboardingForm";

export const metadata: Metadata = {
  title: "Pick a username",
  alternates: { canonical: "/community/onboarding" },
};

export default function OnboardingPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory-warm px-8 pt-24 pb-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">One last step</p>
        <h1 className="mb-6 text-2xl font-semibold text-espresso tracking-tight">Pick a username</h1>
        <OnboardingForm />
      </div>
    </main>
  );
}
