import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/community/auth/RegisterForm";
import { GoogleOneTapPrompt } from "@/components/community/auth/GoogleOneTapPrompt";

export const metadata: Metadata = {
  title: "Create your account",
  alternates: { canonical: "/community/register" },
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory-warm px-8 pt-24 pb-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-2xl font-semibold text-espresso tracking-tight">Create your account</h1>
        <RegisterForm />
        <GoogleOneTapPrompt context="signup" />
        <p className="mt-6 text-center text-sm text-espresso/55">
          Already have an account?{" "}
          <Link href="/community/login" className="text-espresso underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
