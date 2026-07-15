import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
      <p className="mt-2 text-slate-600">
        Access your orders, warranty registrations, and energy plans.
      </p>
      <div className="mt-8">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
