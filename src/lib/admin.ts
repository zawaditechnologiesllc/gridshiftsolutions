"use client";

import { getBrowserSupabase } from "./supabase/client";
import { getApiBaseUrl } from "./api";
import type { Product } from "./types";

/** Current admin's Supabase access token, for authenticating backend calls. */
async function getAccessToken(): Promise<string> {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("You are not signed in.");
  return session.access_token;
}

export interface CjPreviewResult {
  product: Partial<Product> & {
    slug: string;
    name: string;
    price_cents: number;
    cost_cents: number;
    images: string[];
    variant_count: number;
  };
  cj_data: Record<string, unknown>;
}

/** Asks the Render backend to fetch + normalize a CJ product for review. */
export async function cjPreview(input: {
  url: string;
  category: string;
  manufacturer?: string;
  markup?: number;
}): Promise<CjPreviewResult> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("Payments/import API is not configured (NEXT_PUBLIC_API_URL).");
  const token = await getAccessToken();
  const res = await fetch(`${base}/api/admin/cj/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Import failed (${res.status}).`);
  return body as CjPreviewResult;
}

export async function cjStatus(): Promise<{ configured: boolean; defaultMarkup: number }> {
  const base = getApiBaseUrl();
  if (!base) return { configured: false, defaultMarkup: 2.4 };
  const token = await getAccessToken();
  const res = await fetch(`${base}/api/admin/cj/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { configured: false, defaultMarkup: 2.4 };
  return res.json();
}

export interface ProductInput {
  slug: string;
  name: string;
  category: string;
  manufacturer: string;
  tagline: string;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  cost_cents: number | null;
  rating: number;
  badge: string | null;
  tax_credit_eligible: boolean;
  power_output_w: number | null;
  capacity_kwh: number | null;
  key_specs: { label: string; value: string }[];
  specs: { label: string; value: string }[];
  image: string;
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  source: string;
  cj_pid: string | null;
  cj_data?: Record<string, unknown> | null;
}

export async function saveProduct(
  input: ProductInput,
  id?: string
): Promise<{ id: string }> {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload = { ...input, image: input.images[0] ?? input.image };

  if (id) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data as { id: string };
  }
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setProductFlags(
  id: string,
  flags: { active?: boolean; featured?: boolean }
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("products").update(flags).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateOrder(
  id: string,
  fields: { fulfillment_status?: string; tracking_number?: string | null }
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("orders").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
}
