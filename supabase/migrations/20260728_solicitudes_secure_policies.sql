revoke select, update, delete on table public.solicitudes from anon;
grant insert on table public.solicitudes to anon;
grant select, insert, update, delete on table public.solicitudes to authenticated;

alter table public.solicitudes enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'solicitudes'
  loop
    execute format('drop policy if exists %I on public.solicitudes', policy_record.policyname);
  end loop;
end $$;

create policy solicitudes_insert_anon
on public.solicitudes
for insert
to anon
with check (true);

create policy solicitudes_authenticated_select
on public.solicitudes
for select
to authenticated
using (true);

create policy solicitudes_authenticated_insert
on public.solicitudes
for insert
to authenticated
with check (true);

create policy solicitudes_authenticated_update
on public.solicitudes
for update
to authenticated
using (true)
with check (true);

create policy solicitudes_authenticated_delete
on public.solicitudes
for delete
to authenticated
using (true);

notify pgrst, 'reload schema';
