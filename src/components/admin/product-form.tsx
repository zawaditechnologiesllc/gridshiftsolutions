"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProduct, type ProductInput } from "@/lib/admin";
import { CATEGORY_LABELS, type Category, type Product } from "@/lib/types";
import { TrashIcon } from "@/components/icons";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const input =
  "h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600";
const label = "font-mono text-[11px] uppercase tracking-wider text-slate-500";

interface SpecRow {
  label: string;
  value: string;
}

function toDollars(cents: number | null | undefined): string {
  return cents == null ? "" : (cents / 100).toString();
}
function toCents(dollars: string): number {
  const n = Number(dollars);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export default function ProductForm({
  initial,
  id,
}: {
  initial: Partial<Product> & { cj_data?: Record<string, unknown> | null };
  id?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial.name ?? "",
    slug: initial.slug ?? "",
    category: (initial.category as string) ?? "accessories",
    manufacturer: initial.manufacturer ?? "GridShift",
    tagline: initial.tagline ?? "",
    description: initial.description ?? "",
    price: toDollars(initial.price_cents),
    compareAt: toDollars(initial.compare_at_price_cents),
    cost: toDollars(initial.cost_cents),
    rating: (initial.rating ?? 4.6).toString(),
    badge: initial.badge ?? "",
    taxCredit: !!initial.tax_credit_eligible,
    powerW: initial.power_output_w?.toString() ?? "",
    capacityKwh: initial.capacity_kwh?.toString() ?? "",
    stock: (initial.stock ?? 100).toString(),
    featured: !!initial.featured,
    active: initial.active !== false,
    imagesText: (initial.images ?? []).join("\n"),
  });
  const [keySpecs, setKeySpecs] = useState<SpecRow[]>(
    initial.key_specs?.length ? initial.key_specs : [{ label: "", value: "" }]
  );
  const [specs, setSpecs] = useState<SpecRow[]>(
    initial.specs?.length ? initial.specs : [{ label: "", value: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function autoSlug() {
    if (!form.slug && form.name) {
      set(
        "slug",
        form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const images = form.imagesText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (toCents(form.price) <= 0) return setError("Price must be greater than 0.");

    const payload: ProductInput = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      category: form.category,
      manufacturer: form.manufacturer.trim() || "GridShift",
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      price_cents: toCents(form.price),
      compare_at_price_cents: form.compareAt ? toCents(form.compareAt) : null,
      cost_cents: form.cost ? toCents(form.cost) : null,
      rating: Math.min(5, Math.max(0, Number(form.rating) || 4.6)),
      badge: form.badge.trim() || null,
      tax_credit_eligible: form.taxCredit,
      power_output_w: form.powerW ? Math.round(Number(form.powerW)) : null,
      capacity_kwh: form.capacityKwh ? Number(form.capacityKwh) : null,
      key_specs: keySpecs.filter((s) => s.label.trim() && s.value.trim()),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      image: images[0] ?? "/images/products/mounting-kit.svg",
      images: images.length ? images : ["/images/products/mounting-kit.svg"],
      stock: Math.max(0, Math.round(Number(form.stock) || 0)),
      featured: form.featured,
      active: form.active,
      source: (initial.source as string) ?? "manual",
      cj_pid: initial.cj_pid ?? null,
      cj_data: initial.cj_data ?? null,
    };

    setSaving(true);
    try {
      await saveProduct(payload, id);
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
          <div>
            <label className={label} htmlFor="name">Name</label>
            <input
              id="name"
              className={`${input} mt-1.5`}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={autoSlug}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="slug">Slug (URL)</label>
            <input
              id="slug"
              className={`${input} mt-1.5 font-mono`}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="tagline">Tagline</label>
            <input
              id="tagline"
              className={`${input} mt-1.5`}
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={5}
              className="mt-1.5 w-full rounded-sm border border-slate-300 bg-white p-3 text-sm outline-none focus:border-teal-600"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="images">Image URLs (one per line)</label>
            <textarea
              id="images"
              rows={4}
              className="mt-1.5 w-full rounded-sm border border-slate-300 bg-white p-3 font-mono text-xs outline-none focus:border-teal-600"
              value={form.imagesText}
              onChange={(e) => set("imagesText", e.target.value)}
              placeholder="https://..."
            />
            {form.imagesText.trim() && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.imagesText
                  .split(/[\n,]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 8)
                  .map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-14 w-14 rounded-sm border border-slate-200 bg-slate-50 object-contain p-1"
                    />
                  ))}
              </div>
            )}
          </div>

          <SpecEditor title="Key Specs (shown on cards, up to 3)" rows={keySpecs} setRows={setKeySpecs} />
          <SpecEditor title="Full Specifications" rows={specs} setRows={setSpecs} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <div>
              <label className={label} htmlFor="category">Category</label>
              <select
                id="category"
                className={`${input} mt-1.5`}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="manufacturer">Manufacturer / Brand</label>
              <input
                id="manufacturer"
                className={`${input} mt-1.5`}
                value={form.manufacturer}
                onChange={(e) => set("manufacturer", e.target.value)}
              />
            </div>
            <div>
              <label className={label} htmlFor="badge">Badge (optional)</label>
              <input
                id="badge"
                className={`${input} mt-1.5`}
                value={form.badge}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="e.g. BEST VALUE"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-5">
            <div>
              <label className={label} htmlFor="price">Price ($)</label>
              <input id="price" type="number" step="0.01" className={`${input} mt-1.5`}
                value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div>
              <label className={label} htmlFor="compareAt">Compare-at ($)</label>
              <input id="compareAt" type="number" step="0.01" className={`${input} mt-1.5`}
                value={form.compareAt} onChange={(e) => set("compareAt", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="cost">Cost ($)</label>
              <input id="cost" type="number" step="0.01" className={`${input} mt-1.5`}
                value={form.cost} onChange={(e) => set("cost", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="stock">Stock</label>
              <input id="stock" type="number" className={`${input} mt-1.5`}
                value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="rating">Rating</label>
              <input id="rating" type="number" step="0.1" min="0" max="5" className={`${input} mt-1.5`}
                value={form.rating} onChange={(e) => set("rating", e.target.value)} />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <p className={label}>Energy attributes (optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="powerW">Power (W)</label>
                <input id="powerW" type="number" className={`${input} mt-1.5`}
                  value={form.powerW} onChange={(e) => set("powerW", e.target.value)} />
              </div>
              <div>
                <label className={label} htmlFor="capacityKwh">Capacity (kWh)</label>
                <input id="capacityKwh" type="number" step="0.1" className={`${input} mt-1.5`}
                  value={form.capacityKwh} onChange={(e) => set("capacityKwh", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-teal-600"
                checked={form.active} onChange={(e) => set("active", e.target.checked)} />
              Visible in store
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-teal-600"
                checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-teal-600"
                checked={form.taxCredit} onChange={(e) => set("taxCredit", e.target.checked)} />
              Tax-credit eligible
            </label>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 transition-colors hover:bg-yellow-300 disabled:opacity-60"
        >
          {saving ? "Saving…" : id ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex h-11 items-center rounded-sm border border-slate-300 px-5 font-semibold transition-colors hover:border-slate-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SpecEditor({
  title,
  rows,
  setRows,
}: {
  title: string;
  rows: SpecRow[];
  setRows: (rows: SpecRow[]) => void;
}) {
  return (
    <div>
      <p className={label}>{title}</p>
      <div className="mt-2 space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={`${input} flex-1`}
              placeholder="Label"
              value={row.label}
              onChange={(e) =>
                setRows(rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))
              }
            />
            <input
              className={`${input} flex-1`}
              placeholder="Value"
              value={row.value}
              onChange={(e) =>
                setRows(rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))
              }
            />
            <button
              type="button"
              aria-label="Remove spec"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, { label: "", value: "" }])}
        className="mt-2 font-mono text-xs text-teal-700 hover:text-teal-800"
      >
        + Add row
      </button>
    </div>
  );
}
