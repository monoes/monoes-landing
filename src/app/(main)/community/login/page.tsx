import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/community/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  alternates: { canonical: "/community/login" },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory-warm px-8 py-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">Community</p>
        <h1 className="mb-6 text-2xl font-semibold text-espresso tracking-tight">Sign in</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-espresso/55">
          New here?{" "}
          <Link href="/community/register" className="text-espresso underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
