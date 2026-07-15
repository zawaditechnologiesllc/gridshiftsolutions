import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getRelated } from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import ProductGallery from "@/components/product-gallery";
import ProductPurchasePanel from "@/components/product-purchase-panel";
import ProductCard from "@/components/product-card";
import { ArrowRightIcon } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.tagline };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = getRelated(all, product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="font-mono text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-teal-700">
          Products
        </Link>{" "}
        &gt;{" "}
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-teal-700"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>{" "}
        &gt; <span className="text-slate-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <ProductGallery product={product} />

          <section className="mt-12">
            <h2 className="text-xl font-semibold">Technical Specifications</h2>
            <dl className="mt-5 grid gap-x-10 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 border-b border-slate-200 py-3.5"
                >
                  <dt className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    {spec.label}
                  </dt>
                  <dd className="font-mono text-sm text-slate-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">{product.tagline}</p>
          <div className="mt-5 flex items-baseline gap-3">
            <p className="text-4xl font-bold tracking-tight">
              {formatMoney(product.price_cents)}
            </p>
            {product.compare_at_price_cents && (
              <p className="font-mono text-sm text-slate-400 line-through">
                {formatMoney(product.compare_at_price_cents)}
              </p>
            )}
          </div>
          <p className="mt-2 font-mono text-xs text-slate-500">
            By {product.manufacturer} ·{" "}
            {product.stock > 0 ? `${product.stock} in stock` : "Backordered"}
          </p>

          <div className="mt-6">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>

      <section className="mt-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Complete Your Energy System</h2>
            <p className="mt-1 text-slate-600">
              Pair your {product.category === "panels" ? "solar panels" : "system"} with
              GridShift {product.category === "panels" ? "storage" : "components"} for true
              independence.
            </p>
          </div>
          <Link
            href={`/products?category=${product.category === "panels" ? "batteries" : "panels"}`}
            className="hidden items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 sm:flex"
          >
            View All <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-xl font-semibold">Engineering Notes</h2>
        <p className="mt-3 leading-7 text-slate-600">{product.description}</p>
      </section>
    </div>
  );
}
