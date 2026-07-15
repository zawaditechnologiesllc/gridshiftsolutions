import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { filterProducts, getManufacturers, getProducts } from "@/lib/catalog";
import CatalogFilters from "@/components/catalog-filters";
import SortSelect from "@/components/sort-select";
import ProductCard from "@/components/product-card";

export const metadata: Metadata = {
  title: "Technical Catalog",
  description:
    "High-performance photovoltaics and lithium storage solutions engineered for total energy independence.",
};

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function asString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const all = await getProducts();
  const maxPower = asString(params.max_power);
  const products = filterProducts(all, {
    categories: asArray(params.category),
    q: asString(params.q),
    sort: asString(params.sort),
    taxCredit: asString(params.tax_credit) === "1",
    manufacturer: asString(params.manufacturer),
    maxPower: maxPower ? Number(maxPower) : undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="font-mono text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-teal-700">
          Catalog
        </Link>{" "}
        / <span className="text-slate-700">Energy Systems</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Technical Catalog
          </h1>
          <p className="mt-3 max-w-xl leading-7 text-slate-600">
            High-performance photovoltaics and lithium storage solutions engineered
            for total energy independence.
          </p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <Suspense>
            <CatalogFilters manufacturers={getManufacturers(all)} />
          </Suspense>

          <div className="rounded-lg bg-slate-900 p-6 text-white">
            <h2 className="text-lg font-semibold">Energy Audit</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Unsure about sizing? Get a technical assessment for your facility.
            </p>
            <Link
              href="/support"
              className="mt-5 flex h-11 items-center justify-center rounded-sm bg-yellow-400 text-sm font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
            >
              Schedule Now
            </Link>
          </div>
        </aside>

        <section aria-label="Products">
          {asString(params.q) && (
            <p className="mb-4 text-sm text-slate-600">
              {products.length} result{products.length === 1 ? "" : "s"} for{" "}
              <span className="font-mono">&quot;{asString(params.q)}&quot;</span>
            </p>
          )}
          {products.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <p className="font-semibold">No systems match your criteria.</p>
              <p className="mt-2 text-sm text-slate-600">
                Try clearing filters or broadening the power range.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex h-10 items-center rounded-sm bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
