import type { Metadata } from "next";
import CartView from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Project Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ol className="mb-10 hidden items-center justify-center gap-4 font-mono text-sm md:flex">
        {["Energy Plan", "Installation", "Finalize"].map((step, i) => (
          <li key={step} className="flex items-center gap-4">
            <span
              className={`flex items-center gap-2.5 ${
                i === 0 ? "font-semibold text-teal-700" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                  i === 0 ? "border-teal-600 text-teal-700" : "border-slate-300"
                }`}
              >
                {i + 1}
              </span>
              {step}
            </span>
            {i < 2 && <span className="h-px w-16 bg-slate-300" aria-hidden />}
          </li>
        ))}
      </ol>
      <CartView />
    </div>
  );
}
