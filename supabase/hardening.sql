revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.get_order(p_id uuid)
returns table (
  id uuid,
  table_number text,
  items jsonb,
  total numeric,
  status text,
  notes text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.table_number, o.items, o.total, o.status, o.notes, o.created_at
  from public.orders o
  where o.id = p_id;
$$;

revoke execute on function public.get_order(uuid) from public;
grant execute on function public.get_order(uuid) to anon, authenticated;

drop policy if exists "orders_anon_insert" on public.orders;
drop policy if exists "orders_auth_all" on public.orders;
drop policy if exists "orders: customers place orders" on public.orders;
drop policy if exists "orders: admins manage" on public.orders;
create policy "orders: customers place orders" on public.orders for insert to anon, authenticated
  with check (status = 'pending' and jsonb_typeof(items) = 'array' and total >= 0);
create policy "orders: admins manage" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "feedback_auth_all" on public.feedback;
drop policy if exists "feedback: admins manage" on public.feedback;
create policy "feedback: admins manage" on public.feedback for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_auth_all" on public.menu_items;
drop policy if exists "menu_items: admins manage" on public.menu_items;
create policy "menu_items: admins manage" on public.menu_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "catimg_auth_all" on public.category_images;
drop policy if exists "category_images: admins manage" on public.category_images;
create policy "category_images: admins manage" on public.category_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_photos_auth_insert" on storage.objects;
drop policy if exists "menu_photos_auth_update" on storage.objects;
drop policy if exists "menu_photos_auth_delete" on storage.objects;
create policy "menu_photos_auth_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-photos' and public.is_admin());
create policy "menu_photos_auth_update" on storage.objects for update to authenticated
  using (bucket_id = 'menu-photos' and public.is_admin()) with check (bucket_id = 'menu-photos' and public.is_admin());
create policy "menu_photos_auth_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'menu-photos' and public.is_admin());

update public.categories c
   set image_url = ci.image_url
  from public.category_images ci
 where ci.category = c.name_fr
   and ci.image_url is not null
   and (c.image_url is null or c.image_url like 'https://images.unsplash.com/%');

drop policy if exists "orders_anon_select" on public.orders;
