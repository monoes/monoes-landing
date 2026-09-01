import type { Metadata } from "next";
import { Suspense } from "react";
import { OAuthConsentForm } from "@/components/community/auth/OAuthConsentForm";

export const metadata: Metadata = {
  title: "Authorize access",
  robots: { index: false, follow: false },
};

export default function OAuthConsentPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory-warm px-8 pt-24 pb-16">
      <Suspense>
        <OAuthConsentForm />
      </Suspense>
    </main>
  );
}
