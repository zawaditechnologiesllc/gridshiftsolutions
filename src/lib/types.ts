export type Category = "panels" | "batteries" | "inverters" | "accessories";

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  manufacturer: string;
  tagline: string;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  rating: number;
  badge: string | null;
  tax_credit_eligible: boolean;
  power_output_w: number | null;
  capacity_kwh: number | null;
  specs: Spec[];
  key_specs: Spec[];
  image: string;
  images: string[];
  stock: number;
  featured: boolean;
  // Admin / sourcing fields (present once migration 002 is applied).
  cost_cents?: number | null;
  source?: "manual" | "cjdropshipping" | string;
  cj_pid?: string | null;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryMethod = "standard" | "white-glove";

export interface ShippingAddress {
  fullName: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
}

export interface OrderSummary {
  id: string;
  reference: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_credit_estimate_cents: number;
  total_cents: number;
  delivery_method: DeliveryMethod;
  created_at: string;
  // Present for admins reading all orders.
  email?: string;
  user_id?: string | null;
  fulfillment_status?: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
  tracking_number?: string | null;
  shipping_address?: Record<string, unknown>;
  order_items?: {
    name: string;
    unit_price_cents: number;
    quantity: number;
    image: string | null;
  }[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  panels: "Solar Panels",
  batteries: "Storage Batteries",
  inverters: "Hybrid Inverters",
  accessories: "Mounting & Accessories",
};

export const DELIVERY_OPTIONS: {
  id: DeliveryMethod;
  name: string;
  description: string;
  price_cents: number;
}[] = [
  {
    id: "standard",
    name: "Standard Freight",
    description: "Curbside palletized delivery within 5–7 business days.",
    price_cents: 14500,
  },
  {
    id: "white-glove",
    name: "White Glove Delivery",
    description:
      "Scheduled heavy-equipment logistics with signature confirmation and staging.",
    price_cents: 145000,
  },
];

/** Federal Investment Tax Credit — informational estimate only. */
export const TAX_CREDIT_RATE = 0.3;
