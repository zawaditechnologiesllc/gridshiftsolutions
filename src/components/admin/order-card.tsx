"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrder } from "@/lib/admin";
import { formatMoney } from "@/lib/format";
import type { OrderSummary } from "@/lib/types";

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-teal-100 text-teal-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-600",
};

const FULFILLMENT = ["unfulfilled", "processing", "shipped", "delivered", "cancelled"];

export default function OrderCard({ order }: { order: OrderSummary }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(order.fulfillment_status ?? "unfulfilled");
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const addr = order.shipping_address as
    | { fullName?: string; street?: string; unit?: string; city?: string; state?: string; zip?: string }
    | undefined;

  function save() {
    setError(null);
    setSaved(false);
    updateOrder(order.id, { fulfillment_status: status, tracking_number: tracking || null })
      .then(() => {
        setSaved(true);
        startTransition(() => router.refresh());
        setTimeout(() => setSaved(false), 2000);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Update failed."));
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-sm font-semibold">{order.reference}</p>
            <span
              className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                PAYMENT_STYLES[order.status] ?? PAYMENT_STYLES.pending
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{order.email}</p>
          <p className="font-mono text-xs text-slate-400">
            {new Date(order.created_at).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">{formatMoney(order.total_cents)}</p>
          <p className="font-mono text-[11px] text-slate-500">
            {order.delivery_method === "white-glove" ? "White Glove" : "Standard"} delivery
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Items</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {(order.order_items ?? []).map((item, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>
                  {item.name}{" "}
                  <span className="font-mono text-xs text-slate-500">× {item.quantity}</span>
                </span>
                <span className="font-mono">
                  {formatMoney(item.unit_price_cents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {addr && (addr.street || addr.city) && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Ship to
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {addr.fullName}
                <br />
                {addr.street}
                {addr.unit ? `, ${addr.unit}` : ""}
                <br />
                {addr.city}, {addr.state} {addr.zip}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-sm bg-slate-50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Fulfillment
          </p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm capitalize outline-none focus:border-teal-600"
          >
            {FULFILLMENT.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking number"
            className="mt-3 h-10 w-full rounded-sm border border-slate-300 bg-white px-3 font-mono text-sm outline-none focus:border-teal-600"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex h-9 items-center rounded-sm bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Update"}
            </button>
            {saved && <span className="font-mono text-xs text-teal-700">Saved ✓</span>}
            {error && <span className="font-mono text-xs text-red-600">{error}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
