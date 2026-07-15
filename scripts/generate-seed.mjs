// Generates supabase/seed.sql from src/data/products.json so the database
// seed and the bundled fallback catalog never drift apart.
// Run: npm run generate:seed
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const products = JSON.parse(
  readFileSync(join(ROOT, "src", "data", "products.json"), "utf8")
);

const q = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const j = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
const n = (v) => (v == null ? "null" : v);

const rows = products
  .map(
    (p) => `  (${q(p.id)}::uuid, ${q(p.slug)}, ${q(p.name)}, ${q(p.category)}::public.product_category, ${q(
      p.manufacturer
    )}, ${q(p.tagline)}, ${q(p.description)}, ${p.price_cents}, ${n(
      p.compare_at_price_cents
    )}, ${p.rating}, ${q(p.badge)}, ${p.tax_credit_eligible}, ${n(p.power_output_w)}, ${n(
      p.capacity_kwh
    )}, ${j(p.specs)}, ${j(p.key_specs)}, ${q(p.image)}, ${j(p.images)}, ${p.stock}, ${p.featured})`
  )
  .join(",\n");

const sql = `-- GridShift Solutions — product seed
-- GENERATED from src/data/products.json by scripts/generate-seed.mjs. Do not edit by hand.

insert into public.products
  (id, slug, name, category, manufacturer, tagline, description, price_cents, compare_at_price_cents, rating, badge, tax_credit_eligible, power_output_w, capacity_kwh, specs, key_specs, image, images, stock, featured)
values
${rows}
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  manufacturer = excluded.manufacturer,
  tagline = excluded.tagline,
  description = excluded.description,
  price_cents = excluded.price_cents,
  compare_at_price_cents = excluded.compare_at_price_cents,
  rating = excluded.rating,
  badge = excluded.badge,
  tax_credit_eligible = excluded.tax_credit_eligible,
  power_output_w = excluded.power_output_w,
  capacity_kwh = excluded.capacity_kwh,
  specs = excluded.specs,
  key_specs = excluded.key_specs,
  image = excluded.image,
  images = excluded.images,
  stock = excluded.stock,
  featured = excluded.featured;
`;

mkdirSync(join(ROOT, "supabase"), { recursive: true });
writeFileSync(join(ROOT, "supabase", "seed.sql"), sql);
console.log(`wrote supabase/seed.sql (${products.length} products)`);

// Snapshot the catalog for the backend's fallback pricing (used when the
// products table hasn't been seeded yet).
const serverData = join(ROOT, "server", "src", "data");
mkdirSync(serverData, { recursive: true });
writeFileSync(
  join(serverData, "products.json"),
  JSON.stringify(
    products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price_cents: p.price_cents,
      tax_credit_eligible: p.tax_credit_eligible,
      image: p.image,
    })),
    null,
    2
  ) + "\n"
);
console.log("wrote server/src/data/products.json");
