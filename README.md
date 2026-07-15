# GridShift Solutions

A high-performance solar & storage marketplace. Next.js storefront, Supabase for
database + auth, an Express payments API on Render, and Paystack for payments.

Built from the GridShift "High-Performance Identity" design system: an
engineering-led aesthetic with Inter + JetBrains Mono, a deep-navy / eco-teal /
energy-yellow palette, and low-contrast tonal surfaces.

## What's here

| Screen | Route |
| --- | --- |
| Homepage (hero, core components, savings model, testimonials) | `/` |
| Technical Catalog (filters, sort, energy audit) | `/products` |
| Product Detail (gallery, specs, energy estimator, cross-sell) | `/products/[slug]` |
| Project Cart (Energy Summary, tax-credit + production estimate) | `/cart` |
| Checkout (3-step Address → Delivery → Payment) | `/checkout` |
| Payment result (Paystack verification) | `/checkout/callback` |
| Auth (Supabase email/password) | `/login`, `/signup` |
| Account (order history via RLS) | `/account` |
| Solutions / Support | `/solutions`, `/support` |

Fully responsive with a mobile bottom-nav matching the mobile design.

## Architecture

```
Browser ──▶ Next.js (Vercel) ──▶ Supabase (products, auth, orders w/ RLS)
                │
                └──▶ Express API (Render) ──▶ Paystack (initialize / verify)
                                          └──▶ Supabase (service role: writes orders)
                     ▲
       Paystack webhook (charge.success) ─┘   signature-verified
```

- **Prices are never trusted from the client.** The API re-prices every cart line
  by product id against Supabase (falling back to a bundled catalog snapshot).
- **Orders are written only by the backend** using the Supabase service-role key.
  RLS lets a signed-in user read only their own orders.
- **Payment truth comes from two independent paths**: the `/verify` call on the
  callback page and the signature-verified `charge.success` webhook. Either one
  flips an order to `paid`; both are idempotent.
- The frontend and backend both **degrade gracefully** when env vars are absent —
  the storefront runs on bundled seed data so you can develop before provisioning.

## Project layout

```
.
├── src/                  # Next.js App Router frontend
│   ├── app/              # routes
│   ├── components/       # UI components
│   ├── lib/              # catalog, cart, auth, supabase, energy math
│   └── data/products.json# single source of truth for the catalog
├── server/               # Express payments API (deployed to Render)
│   └── src/              # config, paystack, catalog repricing, routes
├── supabase/
│   ├── migrations/001_init.sql  # schema + RLS + triggers
│   └── seed.sql          # generated from src/data/products.json
├── scripts/              # seed + image generators
├── render.yaml           # Render Blueprint
├── vercel.json           # Vercel config
└── .github/workflows/ci.yml
```

## Local development

Prerequisites: Node 20+.

```bash
# 1. Frontend
npm install
cp .env.example .env.local          # fill in values (optional to start)
npm run dev                         # http://localhost:3000

# 2. Backend (separate terminal)
cd server
npm install
cp .env.example .env                # fill in Supabase + Paystack
npm run dev                         # http://localhost:4000
```

Without any env vars the storefront still runs on the 13-product bundled
catalog; auth, checkout, and order history activate once the services below are
configured.

## Deployment

### 1. Supabase (database + auth)

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run `supabase/migrations/001_init.sql`, then
   `supabase/seed.sql`.
3. **Settings → API**: copy the **Project URL**, the **anon** key (frontend), and
   the **service_role** key (backend only — keep secret).
4. **Authentication → URL Configuration**: add your Vercel domain to the redirect
   allow-list (e.g. `https://your-app.vercel.app/**`).

> Regenerate the seed after editing the catalog: `npm run generate:seed`.

### 2. Render (payments API)

Using the included Blueprint:

1. Push this repo to GitHub.
2. In Render, **New → Blueprint** and point it at the repo. `render.yaml` provisions
   the `gridshift-api` web service (root dir `server/`).
3. Set the environment variables (marked `sync: false`):
   - `FRONTEND_URL` — your Vercel URL, e.g. `https://your-app.vercel.app`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `PAYSTACK_SECRET_KEY`, `PAYSTACK_CURRENCY`
4. Deploy. Health check: `GET /health`.

### 3. Paystack (payments)

1. Create an account at [paystack.com](https://paystack.com) and grab your
   **secret key** (test or live).
2. **Settings → API Keys & Webhooks**: set the webhook URL to
   `https://<your-render-service>.onrender.com/api/paystack/webhook`.
   The endpoint verifies the `x-paystack-signature` HMAC before trusting any event.
3. Ensure `PAYSTACK_CURRENCY` matches a currency enabled on your account. Amounts
   are sent in the minor unit (cents/kobo).

### 4. Vercel (frontend)

1. **Import** the repo in Vercel (framework auto-detected as Next.js).
2. **Project Settings → General → Root Directory must be `./`** (the repository
   root — leave it blank/default). The Next.js app lives at `src/app`; the
   `server/` folder is the separate Render backend and must **not** be selected as
   the root. If the Root Directory points at a subdirectory, the build fails with
   `Couldn't find any pages or app directory`.
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` — your Render service URL
   - `NEXT_PUBLIC_CURRENCY` — matches `PAYSTACK_CURRENCY`
4. Deploy. Update `FRONTEND_URL` on Render to the final Vercel domain so CORS and
   the Paystack callback line up.

## Payment flow

1. Checkout posts the cart (product ids + quantities), delivery method, and
   address to `POST /api/checkout/initialize`.
2. The API re-prices server-side, inserts a `pending` order + items, then calls
   Paystack `initialize` and returns the `authorization_url`.
3. The browser redirects to Paystack. After payment, Paystack redirects to
   `/checkout/callback?reference=…`.
4. The callback calls `GET /api/checkout/verify`, which confirms with Paystack and
   marks the order `paid`. The webhook does the same independently, so the order
   reconciles even if the user closes the tab.

## Notes

- Product illustrations are generated SVGs (`scripts/generate-images.mjs`) so the
  repo carries no binary assets and renders identically everywhere.
- The 30% federal tax-credit figure is an **estimate** shown for planning; it is
  not deducted at checkout (it's claimed on the buyer's tax return).
- Test Paystack cards: see
  [paystack.com/docs/payments/test-payments](https://paystack.com/docs/payments/test-payments).
