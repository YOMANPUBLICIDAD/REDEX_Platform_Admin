alter table public.propiedades
  add column if not exists moneda text,
  add column if not exists mapa_url text,
  add column if not exists latitud text,
  add column if not exists longitud text,
  add column if not exists asesor_id uuid,
  add column if not exists asesor_nombre text,
  add column if not exists asesor_telefono text,
  add column if not exists asesor_email text,
  add column if not exists seo_titulo text,
  add column if not exists seo_descripcion text,
  add column if not exists seo_keywords jsonb default '[]'::jsonb,
  add column if not exists destacado boolean default false;

create index if not exists propiedades_destacado_idx on public.propiedades (destacado);

insert into storage.buckets (id, name, public)
values ('propiedades', 'propiedades', true)
on conflict (id) do update set public = excluded.public;

alter table public.propiedades enable row level security;

drop policy if exists propiedades_authenticated_select on public.propiedades;
create policy propiedades_authenticated_select on public.propiedades
for select to authenticated
using (true);

drop policy if exists propiedades_authenticated_insert on public.propiedades;
create policy propiedades_authenticated_insert on public.propiedades
for insert to authenticated
with check (true);

drop policy if exists propiedades_authenticated_update on public.propiedades;
create policy propiedades_authenticated_update on public.propiedades
for update to authenticated
using (true)
with check (true);

drop policy if exists propiedades_authenticated_delete on public.propiedades;
create policy propiedades_authenticated_delete on public.propiedades
for delete to authenticated
using (true);

drop policy if exists propiedades_storage_authenticated_read on storage.objects;
create policy propiedades_storage_authenticated_read on storage.objects
for select to authenticated
using (bucket_id = 'propiedades');

drop policy if exists propiedades_storage_authenticated_insert on storage.objects;
create policy propiedades_storage_authenticated_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'propiedades');

drop policy if exists propiedades_storage_authenticated_update on storage.objects;
create policy propiedades_storage_authenticated_update on storage.objects
for update to authenticated
using (bucket_id = 'propiedades')
with check (bucket_id = 'propiedades');

drop policy if exists propiedades_storage_authenticated_delete on storage.objects;
create policy propiedades_storage_authenticated_delete on storage.objects
for delete to authenticated
using (bucket_id = 'propiedades');
