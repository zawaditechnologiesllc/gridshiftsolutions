"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export default function CatalogFilters({ manufacturers }: { manufacturers: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selectedCategories = params.getAll("category");
  const taxCredit = params.get("tax_credit") === "1";
  const manufacturer = params.get("manufacturer") ?? "all";
  const maxPower = params.get("max_power") ?? "";

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Link href="/products" className="font-mono text-xs text-slate-500 hover:text-teal-700">
          Clear all
        </Link>
      </div>

      <fieldset className="mt-6">
        <legend className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Product Category
        </legend>
        <div className="mt-3 space-y-2.5">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={(e) =>
                  update((next) => {
                    const current = next.getAll("category").filter((c) => c !== cat);
                    next.delete("category");
                    current.forEach((c) => next.append("category", c));
                    if (e.target.checked) next.append("category", cat);
                  })
                }
                className="h-4 w-4 rounded-sm accent-teal-600"
              />
              {CATEGORY_LABELS[cat]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-slate-100 pt-5">
        <legend className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Max Power Output (W)
        </legend>
        <input
          type="range"
          min={300}
          max={15000}
          step={100}
          value={maxPower ? Number(maxPower) : 15000}
          onChange={(e) =>
            update((next) => {
              if (Number(e.target.value) >= 15000) next.delete("max_power");
              else next.set("max_power", e.target.value);
            })
          }
          className="energy-slider mt-4 w-full"
          aria-label="Maximum power output in watts"
        />
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-500">
          <span>300W</span>
          <span>{maxPower ? `≤ ${Number(maxPower).toLocaleString()}W` : "No limit"}</span>
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-slate-100 pt-5">
        <legend className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Manufacturer
        </legend>
        <div className="mt-3 space-y-1.5">
          {["all", ...manufacturers].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() =>
                update((next) => {
                  if (m === "all") next.delete("manufacturer");
                  else next.set("manufacturer", m);
                })
              }
              className={`block w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                manufacturer === m
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-transparent text-slate-600 hover:border-slate-200"
              }`}
            >
              {m === "all" ? "GridShift (All)" : m}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-slate-100 pt-5">
        <legend className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Eligibility
        </legend>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={taxCredit}
            onChange={(e) =>
              update((next) => {
                if (e.target.checked) next.set("tax_credit", "1");
                else next.delete("tax_credit");
              })
            }
            className="h-4 w-4 rounded-sm accent-teal-600"
          />
          <span className="bg-teal-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-teal-800">
            Tax Credit Eligible
          </span>
        </label>
      </fieldset>
    </div>
  );
}
