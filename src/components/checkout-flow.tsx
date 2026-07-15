"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { initializeCheckout } from "@/lib/api";
import { formatMoney, formatNumber } from "@/lib/format";
import { annualCo2OffsetTons, cartAnnualProductionKwh } from "@/lib/energy";
import {
  DELIVERY_OPTIONS,
  type DeliveryMethod,
  type ShippingAddress,
} from "@/lib/types";
import { ArrowRightIcon, LeafIcon, MapPinIcon, TruckIcon } from "./icons";

const STEPS = ["Address", "Delivery", "Payment"] as const;

const inputClass =
  "h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal-600";

export default function CheckoutFlow() {
  const { items, ready, subtotalCents, taxCreditEstimateCents } = useCart();
  const { user, loading, configured } = useAuth();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || loading) {
    return (
      <div className="py-24 text-center font-mono text-sm text-slate-500">
        Preparing checkout…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Nothing to check out</h1>
        <p className="mt-3 text-slate-600">Your project cart is empty.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-12 items-center rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 hover:bg-yellow-300"
        >
          Browse the Catalog
        </Link>
      </div>
    );
  }

  if (configured && !user) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sign in to continue</h1>
        <p className="mt-3 text-slate-600">
          Your order history and warranty registration are tied to your GridShift
          account.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login?next=/checkout"
            className="inline-flex h-12 items-center rounded-sm bg-slate-900 px-6 font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Sign In
          </Link>
          <Link
            href="/signup?next=/checkout"
            className="inline-flex h-12 items-center rounded-sm border border-slate-300 px-6 font-semibold transition-colors hover:border-teal-600"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const shippingCents =
    DELIVERY_OPTIONS.find((d) => d.id === delivery)?.price_cents ?? 0;
  const estimatedTotal = subtotalCents + shippingCents - taxCreditEstimateCents;
  const dueToday = subtotalCents + shippingCents;
  const production = cartAnnualProductionKwh(items);
  const co2 = annualCo2OffsetTons(production);
  const payerEmail = user?.email ?? email;

  const addressValid =
    address.fullName.trim() &&
    address.street.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.zip.trim() &&
    (!configured ? /.+@.+\..+/.test(email) : true);

  async function handlePay() {
    setError(null);
    setSubmitting(true);
    try {
      const { authorizationUrl } = await initializeCheckout({
        email: payerEmail,
        userId: user?.id,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryMethod: delivery,
        address,
      });
      window.location.href = authorizationUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment could not be started.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <ol className="mb-10 flex items-center gap-4 font-mono text-sm">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-4 last:flex-none">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2.5 ${
                  i === step
                    ? "font-semibold text-teal-700"
                    : i < step
                      ? "text-slate-700"
                      : "text-slate-400"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs ${
                    i === step
                      ? "border-teal-600 text-teal-700"
                      : i < step
                        ? "border-slate-400 bg-slate-100"
                        : "border-slate-300"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-slate-300" aria-hidden />
              )}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
            <h1 className="flex items-center gap-3 text-2xl font-semibold">
              <MapPinIcon className="h-6 w-6 text-teal-700" />
              Shipping &amp; Installation Address
            </h1>
            <form
              className="mt-8 grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (addressValid) setStep(1);
              }}
            >
              {!configured && (
                <div>
                  <label className="font-mono text-xs text-slate-600" htmlFor="email">
                    Email (for your receipt)
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} mt-1.5`}
                    placeholder="you@example.com"
                  />
                </div>
              )}
              <div>
                <label className="font-mono text-xs text-slate-600" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className={`${inputClass} mt-1.5`}
                  placeholder="Johnathan Miller"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                <div>
                  <label className="font-mono text-xs text-slate-600" htmlFor="street">
                    Installation Street Address
                  </label>
                  <input
                    id="street"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className={`${inputClass} mt-1.5`}
                    placeholder="123 Renewable Way"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-slate-600" htmlFor="unit">
                    Unit / Suite (Optional)
                  </label>
                  <input
                    id="unit"
                    value={address.unit}
                    onChange={(e) => setAddress({ ...address, unit: e.target.value })}
                    className={`${inputClass} mt-1.5`}
                    placeholder="Suite 405"
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <label className="font-mono text-xs text-slate-600" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className={`${inputClass} mt-1.5`}
                    placeholder="San Francisco"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-slate-600" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className={`${inputClass} mt-1.5`}
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-slate-600" htmlFor="zip">
                    Zip
                  </label>
                  <input
                    id="zip"
                    required
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className={`${inputClass} mt-1.5`}
                    placeholder="94105"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex h-12 items-center gap-2 rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 transition-colors hover:bg-yellow-300 disabled:opacity-50"
                  disabled={!addressValid}
                >
                  Next: Delivery Options <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        )}

        {step === 1 && (
          <section className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
            <h1 className="flex items-center gap-3 text-2xl font-semibold">
              <TruckIcon className="h-6 w-6 text-teal-700" />
              Delivery &amp; Logistics
            </h1>
            <div className="mt-8 space-y-4">
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-sm border p-5 transition-colors ${
                    delivery === opt.id
                      ? "border-teal-600 bg-teal-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === opt.id}
                    onChange={() => setDelivery(opt.id)}
                    className="mt-1 accent-teal-600"
                  />
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between">
                      <span className="font-semibold">{opt.name}</span>
                      <span className="font-mono text-sm">
                        {formatMoney(opt.price_cents)}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {opt.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex h-12 items-center rounded-sm border border-slate-300 px-6 font-semibold transition-colors hover:border-teal-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex h-12 items-center gap-2 rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
              >
                Next: Payment <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
            <h1 className="text-2xl font-semibold">Finalize &amp; Pay</h1>
            <dl className="mt-6 space-y-2 rounded-sm bg-slate-100 p-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Deliver to</dt>
                <dd className="text-right font-medium">
                  {address.fullName} · {address.street}
                  {address.unit ? `, ${address.unit}` : ""}, {address.city},{" "}
                  {address.state} {address.zip}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Delivery method</dt>
                <dd className="font-medium">
                  {DELIVERY_OPTIONS.find((d) => d.id === delivery)?.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Receipt to</dt>
                <dd className="font-mono">{payerEmail}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex items-baseline justify-between">
                <p className="text-slate-600">Due today</p>
                <p className="text-3xl font-bold tracking-tight">
                  {formatMoney(dueToday)}
                </p>
              </div>
              <p className="mt-1 text-right text-xs text-slate-500">
                Federal tax credit ({formatMoney(taxCreditEstimateCents)}) is claimed on
                your tax return, not deducted at checkout.
              </p>
            </div>

            {error && (
              <p className="mt-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-12 items-center rounded-sm border border-slate-300 px-6 font-semibold transition-colors hover:border-teal-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={submitting}
                className="flex h-12 items-center gap-2 rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 transition-colors hover:bg-yellow-300 disabled:opacity-60"
              >
                {submitting ? "Contacting Paystack…" : "Pay Securely with Paystack"}
              </button>
            </div>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Secure AES-256 encrypted checkout · Powered by Paystack
            </p>
          </section>
        )}
      </div>

      <aside>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Energy Solution Summary</h2>
          <ul className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4">
                <span className="flex h-14 w-16 shrink-0 items-center rounded-sm bg-gradient-to-br from-teal-600/10 via-slate-50 to-yellow-400/10 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="flex-1 text-sm">
                  <span className="block font-semibold">{product.name}</span>
                  <span className="block font-mono text-xs text-slate-500">
                    Qty: {quantity}
                    {product.power_output_w
                      ? ` · ${((product.power_output_w * quantity) / 1000).toFixed(1)}kW Peak`
                      : ""}
                  </span>
                  <span className="mt-0.5 block font-mono text-sm text-teal-700">
                    {formatMoney(product.price_cents * quantity)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-mono">{formatMoney(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Service &amp; Logistics</dt>
              <dd className="font-mono">{formatMoney(shippingCents)}</dd>
            </div>
            <div className="flex justify-between text-teal-700">
              <dt>Federal Tax Credit (30% Est.)</dt>
              <dd className="font-mono">-{formatMoney(taxCreditEstimateCents)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Estimated Total
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {formatMoney(estimatedTotal)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Due Today
              </p>
              <p className="font-mono text-lg font-bold text-yellow-600">
                {formatMoney(dueToday)}
              </p>
            </div>
          </div>
          {production > 0 && (
            <p className="mt-5 flex items-start gap-2.5 rounded-sm bg-teal-50 p-4 font-mono text-xs leading-5 text-teal-800">
              <LeafIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Offset {co2.toFixed(1)} tons of CO2 annually with this configuration (
              {formatNumber(production)} kWh/yr).
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
