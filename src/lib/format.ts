const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "USD";

export function formatMoney(cents: number, opts?: { compact?: boolean }): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: Number.isInteger(amount) && opts?.compact ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}
