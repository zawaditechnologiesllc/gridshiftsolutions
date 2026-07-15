import type { CartItem } from "./types";

/** Performance ratio applied to nameplate output (wiring, inverter, soiling losses). */
const PERFORMANCE_RATIO = 0.8;
/** Default electricity price used for savings estimates, $/kWh. */
export const GRID_RATE_PER_KWH = 0.15;
/** Grid carbon intensity, metric tons CO2 per kWh (US average, marginal). */
const TONS_CO2_PER_KWH = 0.000709;

/** Estimated annual production in kWh for a panel wattage at given sun hours/day. */
export function annualYieldKwh(watts: number, sunHoursPerDay: number): number {
  return (watts * sunHoursPerDay * 365 * PERFORMANCE_RATIO) / 1000;
}

export function annualSavingsUsd(watts: number, sunHoursPerDay: number): number {
  return annualYieldKwh(watts, sunHoursPerDay) * GRID_RATE_PER_KWH;
}

/** Total estimated annual production for the panels in a cart, kWh/yr. */
export function cartAnnualProductionKwh(items: CartItem[], sunHours = 4.5): number {
  return items
    .filter((i) => i.product.category === "panels" && i.product.power_output_w)
    .reduce((acc, i) => acc + annualYieldKwh(i.product.power_output_w! * i.quantity, sunHours), 0);
}

export function annualCo2OffsetTons(kwhPerYear: number): number {
  return kwhPerYear * TONS_CO2_PER_KWH;
}
