"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { verifyPayment, type VerifyResponse } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { BoltIcon, CheckIcon } from "./icons";

export default function PaymentCallback() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");
  const { clear } = useCart();
  const [state, setState] = useState<
    | { phase: "verifying" }
    | { phase: "done"; result: VerifyResponse }
    | { phase: "error"; message: string }
  >({ phase: "verifying" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!reference) {
      setState({ phase: "error", message: "Missing payment reference." });
      return;
    }
    verifyPayment(reference)
      .then((result) => {
        if (result.status === "paid") clear();
        setState({ phase: "done", result });
      })
      .catch((e) =>
        setState({
          phase: "error",
          message: e instanceof Error ? e.message : "Verification failed.",
        })
      );
  }, [reference, clear]);

  if (state.phase === "verifying") {
    return (
      <div className="text-center">
        <BoltIcon className="mx-auto h-8 w-8 animate-pulse text-teal-700" />
        <p className="mt-4 font-mono text-sm text-slate-500">
          Verifying payment with Paystack…
        </p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">We couldn&apos;t confirm your payment</h1>
        <p className="mt-3 text-slate-600">{state.message}</p>
        <p className="mt-2 text-sm text-slate-500">
          If you were charged, your order will be reconciled automatically via our
          payment webhook — check your account shortly.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/account"
            className="inline-flex h-11 items-center rounded-sm bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            View My Orders
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center rounded-sm border border-slate-300 px-5 text-sm font-semibold hover:border-teal-600"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  const { result } = state;
  const success = result.status === "paid";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          success ? "bg-teal-100 text-teal-700" : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {success ? <CheckIcon className="h-7 w-7" /> : <BoltIcon className="h-7 w-7" />}
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {success ? "Energy plan confirmed." : "Payment pending"}
      </h1>
      <p className="mt-3 text-slate-600">
        {success
          ? "Your order is confirmed. Our engineering team will contact you to schedule delivery and installation."
          : "Your payment has not been confirmed yet. If you completed the charge, this page will reconcile shortly."}
      </p>
      <dl className="mx-auto mt-8 max-w-sm space-y-2 rounded-sm bg-slate-100 p-5 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Reference</dt>
          <dd className="font-mono">{result.reference}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Amount</dt>
          <dd className="font-mono font-semibold">{formatMoney(result.totalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Status</dt>
          <dd
            className={`font-mono uppercase ${success ? "text-teal-700" : "text-yellow-700"}`}
          >
            {result.status}
          </dd>
        </div>
      </dl>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/account"
          className="inline-flex h-11 items-center rounded-sm bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          View My Orders
        </Link>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-sm border border-slate-300 px-5 text-sm font-semibold hover:border-teal-600"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
