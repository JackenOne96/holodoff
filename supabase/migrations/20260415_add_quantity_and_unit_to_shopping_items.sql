alter table if exists public.shopping_items
  add column if not exists quantity double precision,
  add column if not exists unit text;

update public.shopping_items
set quantity = coalesce(quantity, 1),
    unit = coalesce(unit, 'шт')
where quantity is null or unit is null;

