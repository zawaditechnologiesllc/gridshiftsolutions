"use client";

import { useEffect, useState } from "react";
import { cjPreview, cjStatus, type CjPreviewResult } from "@/lib/admin";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import ProductForm from "./product-form";
import { BoltIcon } from "@/components/icons";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const input =
  "h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600";
const label = "font-mono text-[11px] uppercase tracking-wider text-slate-500";

export default function CjImport() {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>("accessories");
  const [manufacturer, setManufacturer] = useState("");
  const [markup, setMarkup] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CjPreviewResult | null>(null);
  const [status, setStatus] = useState<{ configured: boolean; defaultMarkup: number } | null>(null);

  useEffect(() => {
    cjStatus().then(setStatus).catch(() => setStatus({ configured: false, defaultMarkup: 2.4 }));
  }, []);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!url.trim()) return setError("Paste a CJdropshipping product link.");
    setLoading(true);
    try {
      const res = await cjPreview({
        url: url.trim(),
        category,
        manufacturer: manufacturer.trim() || undefined,
        markup: markup ? Number(markup) : undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <div className="flex gap-3">
            <BoltIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
            <div className="text-sm">
              <p className="font-semibold text-teal-900">Imported from CJdropshipping</p>
              <p className="mt-0.5 text-teal-800">
                Review the mapped fields below and save.{" "}
                {result.product.variant_count > 0 && (
                  <>This CJ product has {result.product.variant_count} variants — the base
                  configuration was imported. </>
                )}
                Cost {(result.product.cost_cents / 100).toFixed(2)} → retail{" "}
                {(result.product.price_cents / 100).toFixed(2)}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="shrink-0 font-mono text-xs text-teal-700 hover:text-teal-900"
          >
            ← New import
          </button>
        </div>
        <ProductForm initial={{ ...result.product, cj_data: result.cj_data }} />
      </div>
    );
  }

  return (
    <form onSubmit={handleFetch} className="max-w-2xl space-y-5 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold">Import from CJdropshipping</h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste a CJ product URL (or product ID). We fetch the title, images,
          price, and specs, then let you review before saving.
        </p>
      </div>

      {status && !status.configured && (
        <p className="rounded-sm border border-yellow-300 bg-yellow-50 p-3 text-sm text-slate-800">
          CJ import isn&apos;t configured on the server yet. Set{" "}
          <code className="font-mono">CJ_EMAIL</code> and{" "}
          <code className="font-mono">CJ_API_KEY</code> on the Render service, or add
          products manually.
        </p>
      )}

      <div>
        <label className={label} htmlFor="cjurl">CJ product link or ID</label>
        <input
          id="cjurl"
          className={`${input} mt-1.5`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://cjdropshipping.com/product/...-p-2408...html"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="cjcat">Category</label>
          <select id="cjcat" className={`${input} mt-1.5`} value={category}
            onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="cjbrand">Brand (optional)</label>
          <input id="cjbrand" className={`${input} mt-1.5`} value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)} placeholder="GridShift" />
        </div>
        <div>
          <label className={label} htmlFor="cjmarkup">
            Markup ×{status ? ` (def ${status.defaultMarkup})` : ""}
          </label>
          <input id="cjmarkup" type="number" step="0.1" className={`${input} mt-1.5`}
            value={markup} onChange={(e) => setMarkup(e.target.value)}
            placeholder={status ? String(status.defaultMarkup) : "2.4"} />
        </div>
      </div>

      {error && (
        <p className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center rounded-sm bg-slate-900 px-6 font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
      >
        {loading ? "Fetching from CJ…" : "Fetch product"}
      </button>
    </form>
  );
}
