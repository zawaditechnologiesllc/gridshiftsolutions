"use client";

import type { DeliveryMethod, ShippingAddress } from "./types";

/** Base URL of the Render-hosted payments API. */
export function getApiBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || null;
}

export interface InitializeCheckoutPayload {
  email: string;
  userId?: string;
  items: { productId: string; quantity: number }[];
  deliveryMethod: DeliveryMethod;
  address: ShippingAddress;
}

export interface InitializeCheckoutResponse {
  authorizationUrl: string;
  reference: string;
}

export async function initializeCheckout(
  payload: InitializeCheckoutPayload
): Promise<InitializeCheckoutResponse> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "Payments API is not configured. Set NEXT_PUBLIC_API_URL to your Render service URL."
    );
  }
  const res = await fetch(`${base}/api/checkout/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.authorizationUrl) {
    throw new Error(body?.error || `Checkout failed (${res.status})`);
  }
  return body as InitializeCheckoutResponse;
}

export interface VerifyResponse {
  status: "paid" | "pending" | "failed";
  reference: string;
  totalCents: number;
  currency: string;
}

export async function verifyPayment(reference: string): Promise<VerifyResponse> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("Payments API is not configured.");
  }
  const res = await fetch(
    `${base}/api/checkout/verify?reference=${encodeURIComponent(reference)}`
  );
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || `Verification failed (${res.status})`);
  }
  return body as VerifyResponse;
}
