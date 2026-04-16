alter table if exists public.family_members
  add column if not exists avatar_icon text,
  add column if not exists gender text check (gender in ('male', 'female'));

alter table if exists public.shopping_items
  add column if not exists emoji text;
