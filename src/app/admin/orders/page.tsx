import { getServerSupabase } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import type { OrderSummary } from "@/lib/types";
import OrderCard from "@/components/admin/order-card";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      "id, reference, email, status, currency, subtotal_cents, shipping_cents, tax_credit_estimate_cents, total_cents, delivery_method, fulfillment_status, tracking_number, shipping_address, created_at, order_items(name, unit_price_cents, quantity, image)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (data ?? []) as unknown as OrderSummary[];
  const paidRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((acc, o) => acc + o.total_cents, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            {orders.length} order{orders.length === 1 ? "" : "s"} · {formatMoney(paidRevenue)} paid
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold">No orders yet.</p>
          <p className="mt-2 text-sm text-slate-600">
            Orders placed through checkout will appear here for fulfillment.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
