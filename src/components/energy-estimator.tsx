"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { annualSavingsUsd, annualYieldKwh } from "@/lib/energy";
import { formatNumber } from "@/lib/format";
import { BoltIcon } from "./icons";

/**
 * Product-page estimator. For panels it models yield from sunlight hours;
 * for storage/inverters it shows backup runtime against household load.
 */
export default function EnergyEstimator({
  product,
  quantity = 1,
}: {
  product: Product;
  quantity?: number;
}) {
  const [sunHours, setSunHours] = useState(5.5);
  const [loadKw, setLoadKw] = useState(1.2);

  if (product.category === "panels" && product.power_output_w) {
    const watts = product.power_output_w * quantity;
    const yieldKwh = annualYieldKwh(watts, sunHours);
    const savings = annualSavingsUsd(watts, sunHours);
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Energy Estimator</h2>
          <BoltIcon className="h-4 w-4 text-teal-700" />
        </div>
        <div className="mt-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-wider text-slate-500">
          <span>Sunlight (hours/day)</span>
          <span className="text-xs font-bold text-slate-900">{sunHours.toFixed(1)} hours</span>
        </div>
        <input
          type="range"
          min={3}
          max={7.5}
          step={0.5}
          value={sunHours}
          onChange={(e) => setSunHours(Number(e.target.value))}
          className="energy-slider mt-2 w-full"
          aria-label="Average sunlight hours per day"
        />
        <div className="mt-4 grid grid-cols-2 divide-x divide-slate-200 rounded-sm bg-slate-100">
          <div className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Estimated Yield
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-teal-700">
              {formatNumber(yieldKwh)} kWh/yr
            </p>
          </div>
          <div className="p-4 text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Est. Savings
            </p>
            <p className="mt-1 font-mono text-lg font-bold">${formatNumber(savings)}/yr</p>
          </div>
        </div>
      </section>
    );
  }

  if (product.capacity_kwh) {
    const hours = (product.capacity_kwh * quantity) / loadKw;
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Backup Runtime Estimator</h2>
          <BoltIcon className="h-4 w-4 text-teal-700" />
        </div>
        <div className="mt-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-wider text-slate-500">
          <span>Household Load (kW)</span>
          <span className="text-xs font-bold text-slate-900">{loadKw.toFixed(1)} kW</span>
        </div>
        <input
          type="range"
          min={0.4}
          max={5}
          step={0.2}
          value={loadKw}
          onChange={(e) => setLoadKw(Number(e.target.value))}
          className="energy-slider mt-2 w-full"
          aria-label="Continuous household load in kilowatts"
        />
        <div className="mt-4 rounded-sm bg-slate-100 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Estimated Backup Runtime
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-teal-700">
            {hours >= 48 ? `${(hours / 24).toFixed(1)} days` : `${hours.toFixed(1)} hours`}
          </p>
        </div>
      </section>
    );
  }

  return null;
}
