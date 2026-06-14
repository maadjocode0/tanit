-- =====================================================================
-- TANIT LOUNGE — Supabase setup
-- Run this in your Supabase dashboard:  SQL Editor → New query → paste → Run
-- Project: wuiimhdiqsrvwnoovoxg
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ORDERS — add columns for notes and (optional) a stable order code
-- ---------------------------------------------------------------------
alter table public.orders
  add column if not exists notes text;

-- The app uses these status values: pending | preparing | done | cancelled
-- If you have a CHECK constraint on status, replace it so "preparing" is allowed:
do $$
begin
  if exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'orders' and column_name = 'status'
      and constraint_name = 'orders_status_check'
  ) then
    alter table public.orders drop constraint orders_status_check;
  end if;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending','preparing','done','cancelled'));

-- ---------------------------------------------------------------------
-- 2) MENU_ITEMS — back-office: availability + price override per item
--    Keyed by the item name as it appears in menu-data.js.
-- ---------------------------------------------------------------------
create table if not exists public.menu_items (
  name           text primary key,
  available      boolean not null default true,
  price_override numeric,            -- null = use the price coded in menu-data.js
  updated_at     timestamptz not null default now()
);

-- =====================================================================
-- 3) SECURITY (Row Level Security)
--    Run this block LAST and test the app right after.
--    Rollback if anything breaks:  the two "disable row level security"
--    lines at the bottom of this file.
-- =====================================================================

-- ORDERS ------------------------------------------------------------
alter table public.orders enable row level security;

-- Customers (anon) may place an order and read order(s) — needed for the
-- order-tracking page. They may NOT modify or delete.
drop policy if exists "orders_anon_insert" on public.orders;
create policy "orders_anon_insert" on public.orders
  for insert to anon with check (true);

drop policy if exists "orders_anon_select" on public.orders;
create policy "orders_anon_select" on public.orders
  for select to anon using (true);

-- Staff (logged-in) may do everything.
drop policy if exists "orders_auth_all" on public.orders;
create policy "orders_auth_all" on public.orders
  for all to authenticated using (true) with check (true);

-- MENU_ITEMS --------------------------------------------------------
alter table public.menu_items enable row level security;

-- Anyone can read availability / price overrides (the public menu needs it).
drop policy if exists "menu_anon_select" on public.menu_items;
create policy "menu_anon_select" on public.menu_items
  for select to anon using (true);

-- Only staff can change availability / prices.
drop policy if exists "menu_auth_all" on public.menu_items;
create policy "menu_auth_all" on public.menu_items
  for all to authenticated using (true) with check (true);

-- =====================================================================
-- ROLLBACK (only if the app breaks after enabling RLS) — run these two:
-- alter table public.orders disable row level security;
-- alter table public.menu_items disable row level security;
-- =====================================================================
