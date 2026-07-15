import type { Metadata } from "next";
import CheckoutFlow from "@/components/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <CheckoutFlow />
    </div>
  );
}
