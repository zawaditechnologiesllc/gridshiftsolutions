"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { CartIcon, CheckIcon } from "./icons";

export function AddToCartIconButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Add ${product.name} to project cart`}
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="flex h-11 w-11 items-center justify-center rounded-sm bg-slate-900 text-white transition-colors hover:bg-teal-700"
    >
      {added ? <CheckIcon className="h-5 w-5" /> : <CartIcon className="h-5 w-5" />}
    </button>
  );
}

export function AddToCartButton({
  product,
  quantity = 1,
}: {
  product: Product;
  quantity?: number;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-yellow-400 text-base font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
    >
      {added ? (
        <>
          <CheckIcon className="h-5 w-5" /> Added to Project Cart
        </>
      ) : (
        <>
          <CartIcon className="h-5 w-5" /> Add to Project Cart
        </>
      )}
    </button>
  );
}
