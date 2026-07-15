"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import BadgeChip from "./badge-chip";

export default function ProductGallery({ product }: { product: Product }) {
  const images = product.images.length > 0 ? product.images : [product.image];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative rounded-lg border border-slate-200 bg-gradient-to-br from-teal-600/10 via-slate-50 to-yellow-400/10 p-8 md:p-12">
        <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
          {product.badge && <BadgeChip label={product.badge} />}
          {product.tax_credit_eligible && <BadgeChip label="TAX CREDIT ELIGIBLE" />}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={product.name}
          className="mx-auto h-72 w-full object-contain md:h-80"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              aria-label={`View image ${i + 1} of ${product.name}`}
              onClick={() => setActive(i)}
              className={`rounded-sm border bg-white p-2 transition-colors ${
                i === active ? "border-teal-600" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-16 w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
