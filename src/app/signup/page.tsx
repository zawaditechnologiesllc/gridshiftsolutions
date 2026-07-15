import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
      <p className="mt-2 text-slate-600">
        Track orders and manage your energy independence plan.
      </p>
      <div className="mt-8">
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
