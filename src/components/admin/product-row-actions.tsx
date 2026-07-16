"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct, setProductFlags } from "@/lib/admin";

export default function ProductRowActions({
  id,
  name,
  active,
  featured,
}: {
  id: string;
  name: string;
  active: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<void>) {
    setError(null);
    fn()
      .then(() => startTransition(() => router.refresh()))
      .catch((e) => setError(e instanceof Error ? e.message : "Action failed."));
  }

  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      {error && <span className="font-mono text-[10px] text-red-600">{error}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setProductFlags(id, { featured: !featured }))}
        className="rounded-sm border border-slate-200 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:border-yellow-400 disabled:opacity-50"
      >
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setProductFlags(id, { active: !active }))}
        className="rounded-sm border border-slate-200 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:border-teal-600 disabled:opacity-50"
      >
        {active ? "Hide" : "Show"}
      </button>
      <Link
        href={`/admin/products/${id}`}
        className="rounded-sm border border-slate-200 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:border-slate-400"
      >
        Edit
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete "${name}"? This cannot be undone.`)) {
            run(() => deleteProduct(id));
          }
        }}
        className="rounded-sm border border-slate-200 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-red-600 transition-colors hover:border-red-400 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
