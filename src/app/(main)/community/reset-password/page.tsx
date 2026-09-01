import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/community/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  alternates: { canonical: "/community/reset-password" },
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory-warm px-8 pt-24 pb-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-2xl font-semibold text-espresso tracking-tight">Set a new password</h1>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
