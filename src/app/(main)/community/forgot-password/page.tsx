import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/community/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  alternates: { canonical: "/community/forgot-password" },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory-warm px-8 pt-24 pb-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-2xl font-semibold text-espresso tracking-tight">Reset your password</h1>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-espresso/55">
          Remembered it?{" "}
          <Link href="/community/login" className="text-espresso underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
