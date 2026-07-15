"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/format";
import { GRID_RATE_PER_KWH } from "@/lib/energy";
import { MapPinIcon, GridIcon } from "./icons";

/** Relative monthly solar irradiance profile (northern hemisphere), Jan–Dec. */
const MONTHLY_PROFILE = [0.55, 0.62, 0.78, 0.9, 1.0, 1.05, 1.08, 1.02, 0.88, 0.72, 0.58, 0.5];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SavingsModel() {
  const [monthly, setMonthly] = useState(350);

  const model = useMemo(() => {
    // Size a system to offset ~90% of the bill, then project against
    // 25 years of utility escalation (~2.5%/yr) net of system cost.
    const annualSpend = monthly * 12;
    const annualKwh = annualSpend / GRID_RATE_PER_KWH;
    const offsetKwh = annualKwh * 0.9;
    const systemKw = offsetKwh / 1450; // ~1,450 kWh per kW-yr
    const systemCost = systemKw * 2600 * 0.7; // $2.60/W net of 30% ITC
    const annualSavings = offsetKwh * GRID_RATE_PER_KWH;
    let cumulative = 0;
    for (let year = 0; year < 25; year++) {
      cumulative += annualSavings * Math.pow(1.025, year);
    }
    const net25 = cumulative - systemCost;
    const payback = systemCost / annualSavings;
    const profileSum = MONTHLY_PROFILE.reduce((a, b) => a + b, 0);
    const monthlyKwh = MONTHLY_PROFILE.map((f) => (offsetKwh * f) / profileSum);
    return { net25, payback, monthlyKwh };
  }, [monthly]);

  const maxKwh = Math.max(...model.monthlyKwh);
  const peakIndex = model.monthlyKwh.indexOf(maxKwh);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="monthly-spend"
          className="font-mono text-xs uppercase tracking-wider text-slate-500"
        >
          Monthly Energy Spend (USD)
        </label>
      </div>
      <input
        id="monthly-spend"
        type="range"
        min={50}
        max={1000}
        step={10}
        value={monthly}
        onChange={(e) => setMonthly(Number(e.target.value))}
        className="energy-slider mt-4 w-full"
      />
      <div className="mt-2 flex items-baseline justify-between font-mono text-xs text-slate-500">
        <span>$50</span>
        <span className="text-xl font-bold text-slate-900">${monthly}</span>
        <span>$1,000+</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-sm bg-slate-100 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            25-Year Savings
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            ${formatNumber(model.net25)}
          </p>
        </div>
        <div className="rounded-sm bg-slate-100 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Payback Period
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {model.payback.toFixed(1)} Yrs
          </p>
        </div>
      </div>

      <figure className="mt-6">
        <figcaption className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Est. Monthly Production
          </span>
          <span className="font-mono text-[10px] text-slate-500">kWh</span>
        </figcaption>
        <div
          className="mt-2 flex h-24 items-end gap-0.5"
          role="img"
          aria-label={`Estimated monthly solar production, peaking at ${formatNumber(maxKwh)} kilowatt-hours in ${MONTHS[peakIndex]}`}
        >
          {model.monthlyKwh.map((kwh, i) => (
            <div key={MONTHS[i]} className="group relative flex-1">
              <div
                className={`w-full rounded-t-[4px] transition-[height] duration-300 ${
                  i === peakIndex ? "bg-slate-900" : "bg-teal-600"
                }`}
                style={{ height: `${Math.max(6, (kwh / maxKwh) * 88)}px` }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-white group-hover:block">
                {MONTHS[i]} · {formatNumber(kwh)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-mono text-[9px] uppercase text-slate-400">
          <span>Jan</span>
          <span className="text-slate-600">
            Peak: {MONTHS[peakIndex]} {formatNumber(maxKwh)} kWh
          </span>
          <span>Dec</span>
        </div>
      </figure>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
        <div className="flex gap-3">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
          <div>
            <p className="font-medium">Location Accuracy</p>
            <p className="text-slate-600">Parcel-level solar irradiance mapping.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <GridIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
          <div>
            <p className="font-medium">Incentive Tracking</p>
            <p className="text-slate-600">
              Automatic calculation of ITC and state-level credits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
