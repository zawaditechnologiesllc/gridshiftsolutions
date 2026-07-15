import { readFileSync } from "node:fs";
import { getServiceSupabase } from "./supabase.js";

export interface PricedProduct {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  tax_credit_eligible: boolean;
  image: string | null;
}

let fallback: PricedProduct[] | null = null;

function getFallback(): PricedProduct[] {
  if (!fallback) {
    // Snapshot generated from src/data/products.json (npm run generate:seed
    // in the repo root); copied to dist/data at build time.
    const url = new URL("./data/products.json", import.meta.url);
    fallback = JSON.parse(readFileSync(url, "utf8")) as PricedProduct[];
  }
  return fallback;
}

/**
 * Reprices cart lines server-side. Client-supplied prices are never trusted:
 * we look products up by id in Supabase, falling back to the bundled catalog
 * snapshot when the table is empty or unreachable.
 */
export async function getPricedProducts(ids: string[]): Promise<Map<string, PricedProduct>> {
  const map = new Map<string, PricedProduct>();
  const supabase = getServiceSupabase();
  if (supabase && ids.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, price_cents, tax_credit_eligible, image")
      .in("id", ids);
    if (!error && data) {
      for (const p of data as PricedProduct[]) map.set(p.id, p);
    }
  }
  if (map.size < ids.length) {
    for (const p of getFallback()) {
      if (ids.includes(p.id) && !map.has(p.id)) map.set(p.id, p);
    }
  }
  return map;
}
