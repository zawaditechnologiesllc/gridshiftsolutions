import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "./config.js";

const BASE = "https://api.paystack.co";

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.paystackSecretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await res.json().catch(() => null)) as PaystackResponse<T> | null;
  if (!res.ok || !body?.status) {
    throw new Error(body?.message || `Paystack request failed (${res.status})`);
  }
  return body.data;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export function initializeTransaction(params: {
  email: string;
  amountSubunits: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializeResult> {
  return paystackFetch<InitializeResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountSubunits,
      currency: config.currency,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
}

export interface VerifyResult {
  status: string; // "success" | "failed" | "abandoned" | ...
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
}

export function verifyTransaction(reference: string): Promise<VerifyResult> {
  return paystackFetch<VerifyResult>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

/** Validates Paystack's x-paystack-signature header (HMAC-SHA512 of the raw body). */
export function isValidWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature || !config.paystackSecretKey) return false;
  const expected = createHmac("sha512", config.paystackSecretKey)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
