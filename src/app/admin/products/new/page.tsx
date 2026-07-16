"use client";

import { useState } from "react";
import Link from "next/link";
import CjImport from "@/components/admin/cj-import";
import ProductForm from "@/components/admin/product-form";

export default function NewProductPage() {
  const [tab, setTab] = useState<"cj" | "manual">("cj");

  return (
    <div>
      <nav className="font-mono text-xs text-slate-500">
        <Link href="/admin/products" className="hover:text-teal-700">Products</Link> / New
      </nav>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Add a product</h1>

      <div className="mt-6 inline-flex rounded-sm border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("cj")}
          className={`rounded-sm px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "cj" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Import from CJ
        </button>
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`rounded-sm px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "manual" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Create manually
        </button>
      </div>

      <div className="mt-6">
        {tab === "cj" ? (
          <CjImport />
        ) : (
          <ProductForm initial={{ source: "manual", active: true, rating: 4.6, stock: 100 }} />
        )}
      </div>
    </div>
  );
}
