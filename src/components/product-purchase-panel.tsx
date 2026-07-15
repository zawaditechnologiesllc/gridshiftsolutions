"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import QuantityStepper from "./quantity-stepper";
import EnergyEstimator from "./energy-estimator";
import { ShieldIcon, TruckIcon, UserIcon } from "./icons";

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Quantity</span>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>
        <div className="mt-4">
          <AddToCartButton product={product} quantity={quantity} />
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-teal-800">
          <TruckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          Ships within 3–5 business days. Free technical consultation included.
        </p>
      </div>

      <EnergyEstimator product={product} quantity={quantity} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-5 text-center">
          <ShieldIcon className="h-5 w-5 text-slate-700" />
          <p className="font-mono text-xs text-slate-600">
            {product.specs.find((s) => s.label.toLowerCase().includes("warranty"))
              ?.value ?? "25-Year Protection"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-5 text-center">
          <UserIcon className="h-5 w-5 text-slate-700" />
          <p className="font-mono text-xs text-slate-600">Pro Install Ready</p>
        </div>
      </div>
    </div>
  );
}
