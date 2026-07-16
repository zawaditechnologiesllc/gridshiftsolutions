-- GridShift Solutions — admin roles, product sourcing, order fulfillment
-- Run after 001_init.sql.

-- ─── Product sourcing columns ────────────────────────────────────────────────

alter table public.products
  add column if not exists cost_cents integer check (cost_cents >= 0),
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'cjdropshipping')),
  add column if not exists cj_pid text,
  add column if not exists cj_data jsonb,
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

-- One imported row per CJ product id (manual rows keep cj_pid null).
create unique index if not exists products_cj_pid_key
  on public.products (cj_pid) where cj_pid is not null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- Only active products are visible to the public; admins see all.
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Active products are viewable by everyone"
  on public.products for select
  using (active = true);

-- ─── Order fulfillment ───────────────────────────────────────────────────────

alter table public.orders
  add column if not exists fulfillment_status text not null default 'unfulfilled'
    check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),
  add column if not exists tracking_number text,
  add column if not exists admin_notes text;

-- ─── Admin roles ─────────────────────────────────────────────────────────────

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- A signed-in user may read only their own admin row (to check their status).
drop policy if exists "Users can check own admin status" on public.admin_users;
create policy "Users can check own admin status"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- SECURITY DEFINER so RLS policies can consult the table without recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- ─── Admin RLS ───────────────────────────────────────────────────────────────

-- Admins have full write access to the catalog (public keeps read on active rows).
drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
  on public.products for select using (public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete using (public.is_admin());

-- Admins can read and update every order.
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select using (public.is_admin());

-- ─── Grant yourself admin (run once, replacing the email) ─────────────────────
-- After signing up in the app with your email, run:
--
--   insert into public.admin_users (user_id, email)
--   select id, email from auth.users where email = 'you@example.com'
--   on conflict (user_id) do nothing;
