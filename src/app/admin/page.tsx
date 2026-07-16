import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatMoney, formatNumber } from "@/lib/format";
import type { OrderSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-teal-100 text-teal-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-600",
};

export default async function AdminDashboard() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const [{ count: productCount }, { count: activeCount }, ordersRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase
      .from("orders")
      .select(
        "id, reference, email, status, total_cents, currency, created_at, fulfillment_status, delivery_method, subtotal_cents, shipping_cents, tax_credit_estimate_cents"
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const orders = (ordersRes.data ?? []) as unknown as OrderSummary[];
  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((acc, o) => acc + o.total_cents, 0);
  const pendingFulfillment = orders.filter(
    (o) => o.status === "paid" && o.fulfillment_status === "unfulfilled"
  ).length;

  const stats = [
    { label: "Products", value: formatNumber(productCount ?? 0), sub: `${activeCount ?? 0} active` },
    { label: "Recent Orders", value: formatNumber(orders.length), sub: "last 8 shown" },
    { label: "Paid Revenue", value: formatMoney(revenue, { compact: true }), sub: "recent paid" },
    { label: "Awaiting Fulfillment", value: formatNumber(pendingFulfillment), sub: "paid + unfulfilled" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center rounded-sm bg-yellow-400 px-4 text-sm font-semibold text-slate-900 hover:bg-yellow-300"
        >
          + Add / Import product
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No orders yet. They&apos;ll appear here after your first checkout.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-2.5 font-medium">Reference</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Total</th>
                  <th className="px-5 py-2.5 font-medium">Payment</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs">{o.reference}</td>
                    <td className="px-5 py-3">{o.email}</td>
                    <td className="px-5 py-3 font-semibold">{formatMoney(o.total_cents)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                          STATUS_STYLES[o.status] ?? STATUS_STYLES.pending
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
