import { config } from "./config.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NormalizedSpec {
  label: string;
  value: string;
}

export interface NormalizedProduct {
  slug: string;
  name: string;
  category: string;
  manufacturer: string;
  tagline: string;
  description: string;
  price_cents: number;
  cost_cents: number;
  compare_at_price_cents: number | null;
  rating: number;
  badge: string | null;
  tax_credit_eligible: boolean;
  power_output_w: number | null;
  capacity_kwh: number | null;
  key_specs: NormalizedSpec[];
  specs: NormalizedSpec[];
  image: string;
  images: string[];
  stock: number;
  featured: boolean;
  source: "cjdropshipping";
  cj_pid: string;
  variant_count: number;
}

export interface NormalizeOptions {
  category?: string;
  manufacturer?: string;
  markup?: number;
}

const VALID_CATEGORIES = ["panels", "batteries", "inverters", "accessories"];

// ─── Helpers (pure, unit-testable) ───────────────────────────────────────────

/** Extracts a CJ product id (pid) from a product URL, share link, or raw id. */
export function parseCjPid(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  // A bare pid (CJ pids are long numeric/uuid-ish strings).
  if (/^[A-F0-9-]{6,40}$/i.test(raw) && !raw.includes("/")) return raw;
  // .../slug-p-<PID>.html
  const pMatch = raw.match(/-p-([A-Za-z0-9-]+)\.html/i);
  if (pMatch) return pMatch[1];
  // ?pid= / ?id= / ?productId=
  const qMatch = raw.match(/[?&](?:pid|id|productId)=([A-Za-z0-9-]+)/i);
  if (qMatch) return qMatch[1];
  // Fallback: a UUID anywhere in the string.
  const uuid = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuid) return uuid[0];
  // Fallback: longest digit run of 6+.
  const digits = raw.match(/\d{6,}/g);
  if (digits) return digits.sort((a, b) => b.length - a.length)[0];
  return null;
}

export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** CJ sell prices can be "1.50", "1.50-3.00", or a number; returns the lowest. */
export function parsePrice(value: unknown): number {
  if (typeof value === "number") return value;
  const s = String(value ?? "").replace(/[^0-9.\-]/g, " ");
  const nums = s.match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return 0;
  return Math.min(...nums.map(Number));
}

/** CJ images arrive as an array, or a JSON-encoded array string, or a single URL. */
export function coerceImages(raw: Record<string, unknown>): string[] {
  const candidates = [raw.productImageSet, raw.productImages, raw.images, raw.productImage];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) {
      return c.map(String).filter((u) => /^https?:\/\//.test(u));
    }
    if (typeof c === "string") {
      const s = c.trim();
      if (s.startsWith("[")) {
        try {
          const arr = JSON.parse(s);
          if (Array.isArray(arr)) {
            const urls = arr.map(String).filter((u) => /^https?:\/\//.test(u));
            if (urls.length) return urls;
          }
        } catch {
          /* not JSON */
        }
      }
      if (/^https?:\/\//.test(s)) return [s];
    }
  }
  return [];
}

function slugify(name: string, pid: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = pid.replace(/[^a-z0-9]/gi, "").slice(-6) || Date.now().toString(36);
  return `${base || "product"}-${suffix}`.toLowerCase();
}

function firstString(raw: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
}

/**
 * Maps a raw CJ product-detail payload onto the GridShift product schema.
 * Pure and defensive — unknown fields fall back to sensible defaults, and the
 * full raw payload is preserved separately (cj_data) so nothing is lost.
 */
export function normalizeCjProduct(
  raw: Record<string, unknown>,
  opts: NormalizeOptions = {}
): NormalizedProduct {
  const pid = firstString(raw, ["pid", "productId", "id"]) || parseCjPid(String(raw.productUrl ?? "")) || "";
  const name = firstString(raw, ["productNameEn", "productName", "nameEn", "name"]) || "Imported Product";
  const images = coerceImages(raw);
  const cost = parsePrice(raw.sellPrice ?? raw.price ?? raw.productPrice);
  const markup = opts.markup && opts.markup > 0 ? opts.markup : config.cjDefaultMarkup;
  const cost_cents = Math.round(cost * 100);
  const price_cents = Math.max(cost_cents, Math.round(cost_cents * markup));

  const category =
    opts.category && VALID_CATEGORIES.includes(opts.category) ? opts.category : "accessories";
  const manufacturer =
    opts.manufacturer?.trim() ||
    firstString(raw, ["supplierName", "brandName"]) ||
    "GridShift Marketplace";

  const weight = firstString(raw, ["productWeight", "packWeight", "packingWeight"]);
  const material = firstString(raw, ["materialNameEn", "materialName"]);
  const cjSku = firstString(raw, ["productSku", "sku"]);
  const variants = Array.isArray(raw.variants) ? (raw.variants as unknown[]) : [];

  const specs: NormalizedSpec[] = [];
  if (weight) specs.push({ label: "Weight", value: `${weight} g` });
  if (material) specs.push({ label: "Material", value: material });
  if (cjSku) specs.push({ label: "SKU", value: cjSku });
  const packing = firstString(raw, ["packing", "packingNameEn", "packingName"]);
  if (packing) specs.push({ label: "Packaging", value: packing });
  if (variants.length) specs.push({ label: "Variants", value: `${variants.length} options` });
  const unit = firstString(raw, ["productUnit", "entryNameEn"]);
  if (unit) specs.push({ label: "Unit", value: unit });
  specs.push({ label: "Fulfillment", value: "CJdropshipping" });

  const key_specs = specs
    .filter((s) => ["Weight", "Material", "Variants", "SKU"].includes(s.label))
    .slice(0, 3);
  while (key_specs.length < 3 && specs[key_specs.length]) {
    if (!key_specs.includes(specs[key_specs.length])) key_specs.push(specs[key_specs.length]);
    else break;
  }

  const descriptionText = stripHtml(firstString(raw, ["description", "productDescription", "descriptionEn"]));
  const tagline =
    descriptionText.slice(0, 140).trim() ||
    `${name} — sourced and fulfilled via CJdropshipping.`;

  return {
    slug: slugify(name, pid || name),
    name,
    category,
    manufacturer,
    tagline: tagline.length < descriptionText.length ? `${tagline}…` : tagline,
    description: descriptionText || tagline,
    price_cents,
    cost_cents,
    compare_at_price_cents: null,
    rating: 4.6,
    badge: null,
    tax_credit_eligible: false,
    power_output_w: null,
    capacity_kwh: null,
    key_specs: key_specs.length ? key_specs : specs.slice(0, 3),
    specs,
    image: images[0] || "/images/products/mounting-kit.svg",
    images: images.length ? images.slice(0, 8) : ["/images/products/mounting-kit.svg"],
    stock: Number(firstString(raw, ["listedNum", "inventory", "stock"])) || 100,
    featured: false,
    source: "cjdropshipping",
    cj_pid: pid,
    variant_count: variants.length,
  };
}

// ─── CJ API client ───────────────────────────────────────────────────────────

interface CachedToken {
  token: string;
  expiresAt: number;
}
let tokenCache: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token;

  const res = await fetch(`${config.cjApiBase}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: config.cjEmail, password: config.cjApiKey }),
  });
  const body = (await res.json().catch(() => null)) as {
    result?: boolean;
    message?: string;
    data?: { accessToken?: string; accessTokenExpiryDate?: string };
  } | null;

  const token = body?.data?.accessToken;
  if (!res.ok || !token) {
    throw new Error(body?.message || `CJ authentication failed (${res.status}).`);
  }
  const expiry = body.data?.accessTokenExpiryDate
    ? new Date(body.data.accessTokenExpiryDate).getTime()
    : now + 24 * 60 * 60 * 1000;
  tokenCache = { token, expiresAt: Number.isFinite(expiry) ? expiry : now + 24 * 60 * 60 * 1000 };
  return token;
}

/** Fetches raw product detail for a pid from CJ. */
export async function queryCjProduct(pid: string): Promise<Record<string, unknown>> {
  const token = await getAccessToken();
  const res = await fetch(`${config.cjApiBase}/product/query?pid=${encodeURIComponent(pid)}`, {
    headers: { "CJ-Access-Token": token },
  });
  const body = (await res.json().catch(() => null)) as {
    result?: boolean;
    message?: string;
    data?: unknown;
  } | null;
  if (!res.ok || !body?.data) {
    throw new Error(body?.message || `CJ product lookup failed (${res.status}).`);
  }
  // `data` is the detail object, or a list wrapper — handle both.
  const data = body.data as Record<string, unknown>;
  if (Array.isArray((data as { list?: unknown[] }).list)) {
    const list = (data as { list: Record<string, unknown>[] }).list;
    if (list.length === 0) throw new Error("No product found for that CJ link.");
    return list[0];
  }
  return data;
}
