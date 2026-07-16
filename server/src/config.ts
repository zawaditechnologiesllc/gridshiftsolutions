export const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || "",
  /** Must be a currency enabled on your Paystack account (USD, NGN, GHS, KES, ZAR...). */
  currency: process.env.PAYSTACK_CURRENCY || "USD",
  // CJdropshipping API 2.0 credentials (Dashboard → Authorization → API Key).
  cjEmail: process.env.CJ_EMAIL || "",
  cjApiKey: process.env.CJ_API_KEY || "",
  cjApiBase: (
    process.env.CJ_API_BASE || "https://developers.cjdropshipping.com/api2.0/v1"
  ).replace(/\/$/, ""),
  /** Default retail markup applied to CJ cost when importing (admin can override). */
  cjDefaultMarkup: Number(process.env.CJ_DEFAULT_MARKUP || 2.4),
};

export function missingPaymentConfig(): string[] {
  const missing: string[] = [];
  if (!config.paystackSecretKey) missing.push("PAYSTACK_SECRET_KEY");
  if (!config.supabaseUrl) missing.push("SUPABASE_URL");
  if (!config.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}

export function cjConfigured(): boolean {
  return Boolean(config.cjEmail && config.cjApiKey);
}
