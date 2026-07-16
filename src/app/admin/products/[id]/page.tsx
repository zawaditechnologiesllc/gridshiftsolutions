import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const product = data as Product & { cj_data?: Record<string, unknown> | null };

  return (
    <div>
      <nav className="font-mono text-xs text-slate-500">
        <Link href="/admin/products" className="hover:text-teal-700">Products</Link> /{" "}
        <span className="text-slate-700">{product.name}</span>
      </nav>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Edit product</h1>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="font-mono text-xs text-teal-700 hover:text-teal-800"
        >
          View in store ↗
        </Link>
      </div>
      <div className="mt-6">
        <ProductForm initial={product} id={product.id} />
      </div>
    </div>
  );
}
