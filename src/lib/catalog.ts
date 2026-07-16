import { createClient } from "@supabase/supabase-js";
import productsJson from "@/data/products.json";
import type { Product } from "./types";

const FALLBACK_PRODUCTS = productsJson as Product[];

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Loads the catalog from Supabase when configured, falling back to the
 * bundled seed data (identical content — see supabase/seed.sql) so the
 * storefront works even before the database is provisioned.
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = getAnonClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("featured", { ascending: false })
        .order("name");
      // Trust the database once connected — an empty catalog is a valid state
      // (a fresh store the admin hasn't stocked yet), not a reason to show demo
      // data. Only a hard error falls back to the bundled seed for resilience.
      if (!error && data) return data as Product[];
    } catch {
      // fall through to bundled data on connection failure
    }
    return FALLBACK_PRODUCTS;
  }
  // No Supabase configured (local dev): use the bundled demo catalog.
  return FALLBACK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export interface CatalogQuery {
  categories?: string[];
  q?: string;
  sort?: string;
  taxCredit?: boolean;
  manufacturer?: string;
  minPower?: number;
  maxPower?: number;
}

export function filterProducts(products: Product[], query: CatalogQuery): Product[] {
  let out = products;
  if (query.categories && query.categories.length > 0) {
    out = out.filter((p) => query.categories!.includes(p.category));
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q)
    );
  }
  if (query.taxCredit) {
    out = out.filter((p) => p.tax_credit_eligible);
  }
  if (query.manufacturer && query.manufacturer !== "all") {
    out = out.filter((p) => p.manufacturer === query.manufacturer);
  }
  if (query.minPower != null) {
    out = out.filter((p) => p.power_output_w == null || p.power_output_w >= query.minPower!);
  }
  if (query.maxPower != null) {
    out = out.filter((p) => p.power_output_w == null || p.power_output_w <= query.maxPower!);
  }
  switch (query.sort) {
    case "price-asc":
      out = [...out].sort((a, b) => a.price_cents - b.price_cents);
      break;
    case "price-desc":
      out = [...out].sort((a, b) => b.price_cents - a.price_cents);
      break;
    case "rating":
      out = [...out].sort((a, b) => b.rating - a.rating);
      break;
    case "efficiency":
    default:
      out = [...out].sort((a, b) => (b.power_output_w ?? 0) - (a.power_output_w ?? 0));
      break;
  }
  return out;
}

export function getManufacturers(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.manufacturer))).sort();
}

export function getRelated(products: Product[], current: Product, count = 3): Product[] {
  const preferred = current.category === "panels" ? "batteries" : "panels";
  const pool = [
    ...products.filter((p) => p.slug !== current.slug && p.category === preferred),
    ...products.filter((p) => p.slug !== current.slug && p.category !== preferred),
  ];
  return pool.slice(0, count);
}
