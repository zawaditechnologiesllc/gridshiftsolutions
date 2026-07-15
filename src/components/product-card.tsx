import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import BadgeChip from "./badge-chip";
import RatingStars from "./rating-stars";
import { AddToCartIconButton } from "./add-to-cart-button";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col rounded-lg border border-slate-200 bg-white transition-colors hover:border-teal-600">
      <Link
        href={`/products/${product.slug}`}
        className="relative block border-b border-slate-100 bg-gradient-to-br from-teal-600/10 via-slate-50 to-yellow-400/10 p-6"
      >
        {product.badge && (
          <span className="absolute left-3 top-3 z-10">
            <BadgeChip label={product.badge} />
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="mx-auto h-40 w-full object-contain"
          loading="lazy"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="hover:text-teal-700">
            <h3 className="text-lg font-semibold leading-snug">{product.name}</h3>
          </Link>
          <RatingStars rating={product.rating} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
          {product.tagline}
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-sm bg-slate-100">
          {product.key_specs.slice(0, 3).map((spec) => (
            <div key={spec.label} className="px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                {spec.label}
              </p>
              <p className="mt-0.5 font-mono text-xs font-medium text-slate-900">
                {spec.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 pt-1">
          <p className="text-xl font-bold tracking-tight">
            {formatMoney(product.price_cents)}
          </p>
          <AddToCartIconButton product={product} />
        </div>
      </div>
    </article>
  );
}
