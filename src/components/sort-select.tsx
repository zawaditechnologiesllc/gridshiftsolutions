"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "efficiency", label: "Highest Efficiency" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-3">
      <span className="font-mono text-xs text-slate-500">Sort by</span>
      <select
        value={params.get("sort") ?? "efficiency"}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", e.target.value);
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
        className="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-teal-600"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
