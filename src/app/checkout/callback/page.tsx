import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentCallback from "@/components/payment-callback";

export const metadata: Metadata = {
  title: "Payment Status",
};

export default function CheckoutCallbackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <Suspense
        fallback={
          <p className="text-center font-mono text-sm text-slate-500">
            Confirming payment…
          </p>
        }
      >
        <PaymentCallback />
      </Suspense>
    </div>
  );
}
