import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import { CATEGORY_LABELS, type Product } from "@/lib/types";
import ProductRowActions from "@/components/admin/product-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            {products.length} product{products.length === 1 ? "" : "s"} in the catalog.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center rounded-sm bg-yellow-400 px-4 text-sm font-semibold text-slate-900 hover:bg-yellow-300"
        >
          + Add / Import product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold">Your catalog is empty.</p>
          <p className="mt-2 text-sm text-slate-600">
            Import products from a CJdropshipping link, or create one manually.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-flex h-11 items-center rounded-sm bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center rounded-sm bg-slate-100 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="h-full w-full object-contain" />
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="block truncate font-medium hover:text-teal-700"
                        >
                          {p.name}
                        </Link>
                        <span className="font-mono text-[11px] text-slate-400">{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {CATEGORY_LABELS[p.category] ?? p.category}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(p.price_cents)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {p.source === "cjdropshipping" ? "CJ" : "Manual"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                          p.active === false
                            ? "bg-slate-200 text-slate-500"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {p.active === false ? "Hidden" : "Live"}
                      </span>
                      {p.featured && (
                        <span className="bg-yellow-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions
                      id={p.id}
                      name={p.name}
                      active={p.active !== false}
                      featured={!!p.featured}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
