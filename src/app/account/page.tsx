import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import type { OrderSummary } from "@/lib/types";
import SignOutButton from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "My Account",
};

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-teal-100 text-teal-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-600",
};

export default async function AccountPage() {
  const supabase = await getServerSupabase();

  if (!supabase) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <div className="mt-8 rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-sm leading-6">
          <p className="font-semibold">Accounts are not configured yet.</p>
          <p className="mt-2">
            Set the Supabase environment variables to enable authentication and
            order history. See the README for setup steps.
          </p>
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, reference, status, currency, subtotal_cents, shipping_cents, tax_credit_estimate_cents, total_cents, delivery_method, created_at, order_items(name, unit_price_cents, quantity, image)"
    )
    .order("created_at", { ascending: false });

  const orderList = (orders ?? []) as unknown as OrderSummary[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
          <p className="mt-2 font-mono text-sm text-slate-600">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Order History</h2>
        {orderList.length === 0 ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-white p-10 text-center">
            <p className="font-semibold">No orders yet.</p>
            <p className="mt-2 text-sm text-slate-600">
              Your energy system purchases will appear here.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex h-11 items-center rounded-sm bg-yellow-400 px-5 text-sm font-semibold text-slate-900 hover:bg-yellow-300"
            >
              Browse the Catalog
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {orderList.map((order) => (
              <article
                key={order.id}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {order.reference}
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {formatMoney(order.total_cents)}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider ${
                      STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                {order.order_items && order.order_items.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-700">
                    {order.order_items.map((item, i) => (
                      <li key={i} className="flex justify-between gap-4">
                        <span>
                          {item.name}{" "}
                          <span className="font-mono text-xs text-slate-500">
                            × {item.quantity}
                          </span>
                        </span>
                        <span className="font-mono">
                          {formatMoney(item.unit_price_cents * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
