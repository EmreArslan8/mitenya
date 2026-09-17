-- ADR-0001 / ADR-0003 — Stok değişince ürün sayfası anında tazelensin.
--
-- Sorun: `pdp-revalidate` webhook'u yalnızca `products` tablosunu dinliyor.
-- Stok `product_stock`'ta tutulduğu için stok değişikliği webhook'u tetiklemiyor;
-- PDP 5 dakikaya kadar eski stoğu ("Sepete ekle" / "Gelince Haber Ver") gösteriyor.
--
-- Çözüm: stok değişince ilgili `products` satırının `updated_at`'ini güncelle.
-- Mevcut webhook bu UPDATE'i görür ve satırın tamamını (slug, id, brand_id)
-- /api/revalidate'e gönderir. Uygulama kodunda değişiklik gerekmez.
--
-- Tasarım:
--  - Satır değil İFADE (statement) seviyesinde: toplu stok güncellemesinde her ürün
--    bir kez güncellenir (100 satır aynı ürüne aitse 1 webhook).
--  - UPDATE'te yalnızca `quantity` gerçekten değiştiyse çalışır (warehouse vb.
--    değişiklikleri sayfayı etkilemez).
--  - Stok kontrolü bununla İLGİLİ DEĞİL: satış kontrolü checkout RPC'lerinde
--    (reserve/finalize/release_checkout_stock) doğrudan veritabanından yapılır.
--
-- Supabase → SQL Editor'da bir kez çalıştırın. Tekrar çalıştırmak güvenlidir.

create or replace function public.touch_product_on_stock_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    update public.products p
       set updated_at = now()
     where p.id in (
       select n.product_id
         from new_rows n
         join old_rows o on o.id = n.id
        where o.quantity is distinct from n.quantity
     );
  elsif tg_op = 'INSERT' then
    update public.products p
       set updated_at = now()
     where p.id in (select product_id from new_rows);
  elsif tg_op = 'DELETE' then
    update public.products p
       set updated_at = now()
     where p.id in (select product_id from old_rows);
  end if;
  return null;
end;
$$;

-- Transition table'lı tetikleyicide birden fazla olay tanımlanamaz → üç ayrı tetikleyici.
drop trigger if exists trg_touch_product_on_stock_update on public.product_stock;
create trigger trg_touch_product_on_stock_update
  after update on public.product_stock
  referencing old table as old_rows new table as new_rows
  for each statement execute function public.touch_product_on_stock_change();

drop trigger if exists trg_touch_product_on_stock_insert on public.product_stock;
create trigger trg_touch_product_on_stock_insert
  after insert on public.product_stock
  referencing new table as new_rows
  for each statement execute function public.touch_product_on_stock_change();

drop trigger if exists trg_touch_product_on_stock_delete on public.product_stock;
create trigger trg_touch_product_on_stock_delete
  after delete on public.product_stock
  referencing old table as old_rows
  for each statement execute function public.touch_product_on_stock_change();

-- ---------------------------------------------------------------------------
-- GERİ ALMA (gerekirse ayrı çalıştırın):
--
-- drop trigger if exists trg_touch_product_on_stock_update on public.product_stock;
-- drop trigger if exists trg_touch_product_on_stock_insert on public.product_stock;
-- drop trigger if exists trg_touch_product_on_stock_delete on public.product_stock;
-- drop function if exists public.touch_product_on_stock_change();
