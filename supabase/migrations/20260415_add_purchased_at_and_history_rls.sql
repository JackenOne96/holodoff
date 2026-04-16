alter table if exists public.shopping_items
  add column if not exists purchased_at timestamptz;

-- Optional index for faster history queries
create index if not exists shopping_items_family_purchased_at_idx
  on public.shopping_items (family_id, purchased, purchased_at desc);
