drop policy if exists "orders: customers place orders" on public.orders;
drop policy if exists "orders_anon_insert" on public.orders;
drop policy if exists "feedback_anon_insert" on public.feedback;
drop function if exists public.get_order(uuid);
