-- Products catalog + fast search for autocomplete

create extension if not exists pg_trgm;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  synonyms text[] default '{}'::text[],
  search_vector tsvector,
  icon text default '📦',
  proteins double precision,
  fats double precision,
  carbs double precision,
  is_food boolean not null default true,
  created_at timestamptz not null default now()
);

-- Search vector trigger
create or replace function public.products_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('russian', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(array_to_string(new.synonyms, ' '), '')), 'B');
  return new;
end;
$$;

drop trigger if exists trg_products_search_vector on public.products;
create trigger trg_products_search_vector
before insert or update of name, synonyms
on public.products
for each row
execute function public.products_search_vector_trigger();

-- Indexes
create index if not exists idx_products_name_trgm
  on public.products using gin (name gin_trgm_ops);

create index if not exists idx_products_search_vector
  on public.products using gin (search_vector);

-- RPC: mixed prefix + full-text search
create or replace function public.search_products(search_query text)
returns table (
  id uuid,
  name text,
  icon text,
  proteins double precision,
  fats double precision,
  carbs double precision,
  is_food boolean
)
language plpgsql
stable
as $$
declare
  q text := trim(coalesce(search_query, ''));
begin
  if q = '' then
    return;
  end if;

  return query
  with prefix as (
    select p.id, p.name, p.icon, p.proteins, p.fats, p.carbs, p.is_food
    from public.products p
    where p.name ilike q || '%'
    order by similarity(p.name, q) desc, p.name asc
    limit 10
  ),
  prefix_count as (
    select count(*) as c from prefix
  ),
  fts as (
    select p.id, p.name, p.icon, p.proteins, p.fats, p.carbs, p.is_food
    from public.products p
    where (select c from prefix_count) < 5
      and p.search_vector @@ websearch_to_tsquery('russian', q)
      and p.id not in (select id from prefix)
    order by ts_rank_cd(p.search_vector, websearch_to_tsquery('russian', q)) desc, p.name asc
    limit (15 - (select c from prefix_count))
  )
  select * from prefix
  union all
  select * from fts
  limit 15;
end;
$$;

-- Seed (minimal set, extend later)
insert into public.products (name, synonyms, icon, proteins, fats, carbs, is_food) values
  ('Сок Добрый яблочный 1л', array['сок','добрый','яблочный','нектар'], '🧃', 0.5, 0.1, 10.0, true),
  ('Сок Добрый апельсиновый 1л', array['сок','добрый','апельсиновый','нектар'], '🧃', 0.5, 0.1, 10.0, true),
  ('Молоко 2.5%', array['молоко','2.5','пастеризованное'], '🥛', 2.9, 2.5, 4.8, true),
  ('Хлеб', array['хлеб','батон','булка'], '🍞', 8.0, 1.0, 49.0, true),
  ('Яйца', array['яйца','яйцо'], '🥚', 12.7, 11.5, 0.7, true),
  ('Сыр', array['сыр','твердый','плавленый'], '🧀', 24.0, 30.0, 0.0, true),
  ('Курица', array['курица','филе','бедро'], '🍗', 23.6, 1.9, 0.4, true),
  ('Перчатки', array['перчатки','хозтовары'], '🧤', null, null, null, false),
  ('Мусорные пакеты', array['мусорные','пакеты','мешки'], '🗑️', null, null, null, false)
on conflict do nothing;

