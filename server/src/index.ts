import express from "express";
import cors from "cors";
import { randomBytes } from "node:crypto";
import { config, cjConfigured, missingPaymentConfig } from "./config.js";
import { getServiceSupabase } from "./supabase.js";
import { getPricedProducts } from "./catalog.js";
import {
  initializeTransaction,
  isValidWebhookSignature,
  verifyTransaction,
} from "./paystack.js";
import { AuthError, requireAdmin } from "./auth.js";
import { normalizeCjProduct, parseCjPid, queryCjProduct } from "./cj.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set(
  [config.frontendUrl, "http://localhost:3000", "http://127.0.0.1:3000"].filter(Boolean)
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) callback(null, true);
      else callback(new Error(`Origin ${origin} not allowed`));
    },
  })
);

const DELIVERY_PRICES: Record<string, number> = {
  standard: 14500,
  "white-glove": 145000,
};
const TAX_CREDIT_RATE = 0.3;
const MAX_ITEMS = 50;
const MAX_QTY = 999;

function newReference(): string {
  return `GS-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

// ─── Health ──────────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({ service: "gridshift-api", status: "ok" });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    paymentsConfigured: missingPaymentConfig().length === 0,
    currency: config.currency,
  });
});

// ─── Webhook (raw body BEFORE json parser) ───────────────────────────────────

app.post(
  "/api/paystack/webhook",
  express.raw({ type: "*/*" }),
  async (req, res) => {
    try {
      const signature = req.header("x-paystack-signature");
      if (!isValidWebhookSignature(req.body as Buffer, signature)) {
        res.status(401).json({ error: "Invalid signature" });
        return;
      }
      const event = JSON.parse((req.body as Buffer).toString("utf8"));
      const supabase = getServiceSupabase();
      if (!supabase) {
        res.status(503).json({ error: "Database not configured" });
        return;
      }

      if (event.event === "charge.success") {
        const reference: string | undefined = event.data?.reference;
        if (reference) {
          await supabase
            .from("orders")
            .update({
              status: "paid",
              paid_at: event.data?.paid_at ?? new Date().toISOString(),
              paystack_payload: event.data ?? null,
            })
            .eq("reference", reference)
            .neq("status", "paid");
        }
      } else if (event.event === "charge.failed") {
        const reference: string | undefined = event.data?.reference;
        if (reference) {
          await supabase
            .from("orders")
            .update({ status: "failed", paystack_payload: event.data ?? null })
            .eq("reference", reference)
            .eq("status", "pending");
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("webhook error", err);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

app.use(express.json());

// ─── Checkout ────────────────────────────────────────────────────────────────

interface CheckoutBody {
  email?: string;
  userId?: string;
  items?: { productId?: string; quantity?: number }[];
  deliveryMethod?: string;
  address?: Record<string, unknown>;
}

app.post("/api/checkout/initialize", async (req, res) => {
  try {
    const missing = missingPaymentConfig();
    if (missing.length > 0) {
      res.status(503).json({
        error: `Payments are not configured on the server. Missing: ${missing.join(", ")}.`,
      });
      return;
    }

    const body = req.body as CheckoutBody;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!/.+@.+\..+/.test(email)) {
      res.status(400).json({ error: "A valid email is required." });
      return;
    }
    const rawItems = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
    const items = rawItems
      .map((i) => ({
        productId: String(i.productId ?? ""),
        quantity: Math.min(Math.max(1, Math.floor(Number(i.quantity) || 0)), MAX_QTY),
      }))
      .filter((i) => i.productId);
    if (items.length === 0) {
      res.status(400).json({ error: "Cart is empty." });
      return;
    }
    const deliveryMethod =
      body.deliveryMethod && body.deliveryMethod in DELIVERY_PRICES
        ? body.deliveryMethod
        : "standard";

    const priced = await getPricedProducts(items.map((i) => i.productId));
    const unknown = items.filter((i) => !priced.has(i.productId));
    if (unknown.length > 0) {
      res.status(400).json({ error: "Cart contains unknown products." });
      return;
    }

    let subtotal = 0;
    let eligibleSubtotal = 0;
    const orderItems = items.map((i) => {
      const p = priced.get(i.productId)!;
      subtotal += p.price_cents * i.quantity;
      if (p.tax_credit_eligible) eligibleSubtotal += p.price_cents * i.quantity;
      return {
        product_id: p.id,
        name: p.name,
        unit_price_cents: p.price_cents,
        quantity: i.quantity,
        image: p.image,
      };
    });
    const shipping = DELIVERY_PRICES[deliveryMethod];
    const taxCreditEstimate = Math.round(eligibleSubtotal * TAX_CREDIT_RATE);
    const total = subtotal + shipping;
    const reference = newReference();

    const supabase = getServiceSupabase()!;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: body.userId || null,
        email,
        reference,
        status: "pending",
        currency: config.currency,
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        tax_credit_estimate_cents: taxCreditEstimate,
        total_cents: total,
        delivery_method: deliveryMethod,
        shipping_address: body.address ?? {},
      })
      .select("id")
      .single();
    if (orderError || !order) {
      console.error("order insert failed", orderError);
      res.status(500).json({ error: "Could not create order." });
      return;
    }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
    if (itemsError) {
      console.error("order items insert failed", itemsError);
      res.status(500).json({ error: "Could not create order items." });
      return;
    }

    const init = await initializeTransaction({
      email,
      amountSubunits: total,
      reference,
      callbackUrl: `${config.frontendUrl}/checkout/callback`,
      metadata: { order_id: order.id, delivery_method: deliveryMethod },
    });

    res.json({ authorizationUrl: init.authorization_url, reference });
  } catch (err) {
    console.error("initialize error", err);
    const message = err instanceof Error ? err.message : "Checkout failed.";
    res.status(502).json({ error: message });
  }
});

app.get("/api/checkout/verify", async (req, res) => {
  try {
    const reference = String(req.query.reference ?? "").trim();
    if (!reference) {
      res.status(400).json({ error: "Missing reference." });
      return;
    }
    const missing = missingPaymentConfig();
    if (missing.length > 0) {
      res.status(503).json({
        error: `Payments are not configured on the server. Missing: ${missing.join(", ")}.`,
      });
      return;
    }

    const supabase = getServiceSupabase()!;
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, total_cents, currency")
      .eq("reference", reference)
      .single();
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    if (order.status !== "paid") {
      const tx = await verifyTransaction(reference);
      if (tx.status === "success" && tx.amount >= order.total_cents) {
        await supabase
          .from("orders")
          .update({
            status: "paid",
            paid_at: tx.paid_at ?? new Date().toISOString(),
          })
          .eq("id", order.id)
          .neq("status", "paid");
        order.status = "paid";
      } else if (tx.status === "failed") {
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("id", order.id)
          .eq("status", "pending");
        order.status = "failed";
      }
    }

    res.json({
      status: order.status === "paid" ? "paid" : order.status === "failed" ? "failed" : "pending",
      reference,
      totalCents: order.total_cents,
      currency: order.currency,
    });
  } catch (err) {
    console.error("verify error", err);
    const message = err instanceof Error ? err.message : "Verification failed.";
    res.status(502).json({ error: message });
  }
});

// ─── Admin: CJdropshipping import ────────────────────────────────────────────

app.get("/api/admin/cj/status", async (req, res) => {
  try {
    await requireAdmin(req);
    res.json({ configured: cjConfigured(), defaultMarkup: config.cjDefaultMarkup });
  } catch (err) {
    handleAdminError(res, err);
  }
});

interface CjImportBody {
  url?: string;
  pid?: string;
  category?: string;
  manufacturer?: string;
  markup?: number;
}

app.post("/api/admin/cj/preview", async (req, res) => {
  try {
    await requireAdmin(req);
    if (!cjConfigured()) {
      res.status(503).json({
        error: "CJdropshipping is not configured. Set CJ_EMAIL and CJ_API_KEY.",
      });
      return;
    }
    const body = req.body as CjImportBody;
    const pid = parseCjPid(body.pid || body.url || "");
    if (!pid) {
      res.status(400).json({ error: "Could not find a product id in that CJ link." });
      return;
    }
    const raw = await queryCjProduct(pid);
    const product = normalizeCjProduct(raw, {
      category: body.category,
      manufacturer: body.manufacturer,
      markup: body.markup,
    });
    res.json({ product, cj_data: raw });
  } catch (err) {
    handleAdminError(res, err);
  }
});

function handleAdminError(res: express.Response, err: unknown): void {
  if (err instanceof AuthError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error("admin error", err);
  const message = err instanceof Error ? err.message : "Request failed.";
  res.status(502).json({ error: message });
}

app.listen(config.port, () => {
  console.log(`gridshift-api listening on :${config.port}`);
  const missing = missingPaymentConfig();
  if (missing.length > 0) {
    console.warn(`⚠ payments disabled — missing env: ${missing.join(", ")}`);
  }
});
