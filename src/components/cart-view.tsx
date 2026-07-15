"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatMoney, formatNumber } from "@/lib/format";
import { cartAnnualProductionKwh } from "@/lib/energy";
import { DELIVERY_OPTIONS } from "@/lib/types";
import QuantityStepper from "./quantity-stepper";
import { BoltIcon, ShieldIcon, TrashIcon, TruckIcon } from "./icons";

const STANDARD_SHIPPING = DELIVERY_OPTIONS[0].price_cents;
/** Reference capacity used to scale the production meter, kWh/yr. */
const PRODUCTION_SCALE_KWH = 12400;

export default function CartView() {
  const { items, ready, subtotalCents, taxCreditEstimateCents, updateQuantity, removeItem } =
    useCart();

  if (!ready) {
    return (
      <div className="py-24 text-center font-mono text-sm text-slate-500">
        Loading configuration…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your project cart is empty</h1>
        <p className="mt-3 text-slate-600">
          Start building your energy system from the technical catalog.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-12 items-center rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
        >
          Browse the Catalog
        </Link>
      </div>
    );
  }

  const shippingCents = STANDARD_SHIPPING;
  const totalAfterIncentives = subtotalCents + shippingCents - taxCreditEstimateCents;
  const production = cartAnnualProductionKwh(items);
  const productionPct = Math.min(100, (production / PRODUCTION_SCALE_KWH) * 100);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Review Your Configuration
        </h1>
        <div className="mt-8 space-y-5">
          {items.map(({ product, quantity }) => (
            <article
              key={product.id}
              className="rounded-lg border border-slate-200 bg-white"
            >
              <div className="flex gap-5 p-5">
                <Link
                  href={`/products/${product.slug}`}
                  className="hidden h-28 w-36 shrink-0 items-center rounded-sm bg-gradient-to-br from-teal-600/10 via-slate-50 to-yellow-400/10 p-3 sm:flex"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-lg font-semibold hover:text-teal-700"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-slate-600">{product.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatMoney(product.price_cents * quantity)}
                      </p>
                      <p className="font-mono text-xs text-slate-500">
                        {quantity} × {formatMoney(product.price_cents)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <QuantityStepper
                      value={quantity}
                      onChange={(q) => updateQuantity(product.id, q)}
                      min={0}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
              {product.tax_credit_eligible && (
                <p className="flex gap-4 border-t border-slate-100 bg-slate-50 px-5 py-2.5 font-mono text-xs text-teal-800">
                  <span>✓ High Efficiency</span>
                  <span>✓ Tax Credit Eligible</span>
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <aside className="space-y-5 lg:pt-20">
        <div className="rounded-lg bg-slate-900 p-7 text-white">
          <h2 className="text-xl font-semibold">Energy Summary</h2>
          <dl className="mt-6 space-y-3 border-t border-slate-700 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Subtotal</dt>
              <dd className="font-mono">{formatMoney(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Estimated Shipping</dt>
              <dd className="font-mono">{formatMoney(shippingCents)}</dd>
            </div>
            <div className="flex justify-between text-yellow-400">
              <dt className="flex items-center gap-1.5">
                <BoltIcon className="h-3.5 w-3.5" /> Federal Tax Credit (30%)
              </dt>
              <dd className="font-mono">-{formatMoney(taxCreditEstimateCents)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-end justify-between border-t border-slate-700 pt-5">
            <p className="text-sm text-slate-400">Total Investment</p>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {formatMoney(totalAfterIncentives)}
              </p>
              <p className="text-xs text-slate-400">after estimated incentives</p>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex h-12 items-center justify-center rounded-sm bg-yellow-400 font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
          >
            Proceed to Checkout
          </Link>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Secure AES-256 Encrypted Checkout
          </p>

          {production > 0 && (
            <div className="mt-6 rounded-sm border border-slate-700 bg-slate-800/60 p-4">
              <p className="font-mono text-xs text-teal-300">Est. Annual Production</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-yellow-400"
                  style={{ width: `${productionPct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
                <span>0 kWh</span>
                <span>{formatNumber(production)} kWh / yr</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5">
          <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
          <div>
            <p className="font-semibold">White Glove Delivery</p>
            <p className="mt-1 text-sm text-slate-600">
              Scheduled heavy-equipment logistics with signature confirmation.
            </p>
          </div>
        </div>
        <div className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5">
          <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
          <div>
            <p className="font-semibold">25-Year Warranty</p>
            <p className="mt-1 text-sm text-slate-600">
              Industry-leading protection for your energy independence.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
