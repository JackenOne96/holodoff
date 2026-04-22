do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'family_members'
      and policyname = 'family_members_insert_limit_4'
  ) then
    create policy family_members_insert_limit_4
      on public.family_members
      for insert
      to authenticated
      with check (
        auth_user_id = auth.uid()
        and
        (
          select count(*)
          from public.family_members fm
          where fm.family_id = family_members.family_id
        ) < 4
      );
  end if;
end
$$;
