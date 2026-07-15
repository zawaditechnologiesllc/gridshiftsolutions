export const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || "",
  /** Must be a currency enabled on your Paystack account (USD, NGN, GHS, KES, ZAR...). */
  currency: process.env.PAYSTACK_CURRENCY || "USD",
};

export function missingPaymentConfig(): string[] {
  const missing: string[] = [];
  if (!config.paystackSecretKey) missing.push("PAYSTACK_SECRET_KEY");
  if (!config.supabaseUrl) missing.push("SUPABASE_URL");
  if (!config.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}
