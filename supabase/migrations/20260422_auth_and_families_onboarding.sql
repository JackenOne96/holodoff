alter table if exists public.families
  add column if not exists name text,
  add column if not exists created_by uuid,
  add column if not exists trial_ends_at timestamptz;

alter table if exists public.family_members
  add column if not exists auth_user_id uuid;

-- RLS enable (idempotent)
alter table if exists public.families enable row level security;
alter table if exists public.family_members enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'families' and policyname = 'families_select_for_members_or_owner'
  ) then
    create policy families_select_for_members_or_owner
      on public.families
      for select
      to anon, authenticated
      using (
        created_by = auth.uid()
        or exists (
          select 1 from public.family_members fm
          where fm.family_id = families.id and fm.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'families' and policyname = 'families_insert_owner_only'
  ) then
    create policy families_insert_owner_only
      on public.families
      for insert
      to authenticated
      with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'families' and policyname = 'families_update_owner_only'
  ) then
    create policy families_update_owner_only
      on public.families
      for update
      to authenticated
      using (created_by = auth.uid())
      with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'family_members' and policyname = 'family_members_select_same_user'
  ) then
    create policy family_members_select_same_user
      on public.family_members
      for select
      to anon, authenticated
      using (
        auth_user_id = auth.uid()
        or exists (
          select 1
          from public.family_members me
          where me.family_id = family_members.family_id
            and me.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'family_members' and policyname = 'family_members_insert_self'
  ) then
    create policy family_members_insert_self
      on public.family_members
      for insert
      to authenticated
      with check (auth_user_id = auth.uid());
  end if;
end
$$;
