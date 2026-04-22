create table if not exists public.family_signals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  sender_member_id uuid not null,
  type text not null check (type in ('alert', 'ok', 'store', 'ack')),
  created_at timestamptz not null default now()
);

create index if not exists family_signals_family_created_idx
  on public.family_signals (family_id, created_at desc);

alter table if exists public.family_signals enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'family_signals'
      and policyname = 'family_signals_select_for_family_members'
  ) then
    create policy family_signals_select_for_family_members
      on public.family_signals
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.family_members fm
          where fm.family_id = family_signals.family_id
            and fm.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'family_signals'
      and policyname = 'family_signals_insert_by_member'
  ) then
    create policy family_signals_insert_by_member
      on public.family_signals
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.family_members fm
          where fm.id = family_signals.sender_member_id
            and fm.family_id = family_signals.family_id
            and fm.auth_user_id = auth.uid()
        )
      );
  end if;
end
$$;
