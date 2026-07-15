-- GridShift Solutions — initial schema
-- Run in the Supabase SQL Editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ─── Enums ───────────────────────────────────────────────────────────────────

do $$ begin
  create type public.product_category as enum ('panels', 'batteries', 'inverters', 'accessories');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ─── Products ────────────────────────────────────────────────────────────────

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category public.product_category not null,
  manufacturer text not null default 'GridShift',
  tagline text not null default '',
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents >= 0),
  rating numeric(2,1) not null default 4.8,
  badge text,
  tax_credit_eligible boolean not null default false,
  power_output_w integer,
  capacity_kwh numeric,
  specs jsonb not null default '[]'::jsonb,
  key_specs jsonb not null default '[]'::jsonb,
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

-- ─── Profiles ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Orders ──────────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  reference text unique not null,
  status public.order_status not null default 'pending',
  currency text not null default 'USD',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  tax_credit_estimate_cents integer not null default 0,
  total_cents integer not null check (total_cents >= 0),
  delivery_method text not null default 'standard',
  shipping_address jsonb not null default '{}'::jsonb,
  paystack_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_reference_idx on public.orders (reference);

alter table public.orders enable row level security;

-- Orders are written exclusively by the backend (service role bypasses RLS).
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- ─── Order items ─────────────────────────────────────────────────────────────

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  image text
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
