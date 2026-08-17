create table if not exists public.proyectos (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  slug text,
  nombre text not null,
  ubicacion text,
  ciudad text,
  sector text,
  tipo text,
  categoria_filtro text,
  cantidad_disponible text,
  precio_texto text,
  reserva text,
  descripcion text,
  imagen_portada text,
  etiqueta text,
  color_etiqueta text,
  pills jsonb default '[]'::jsonb,
  amenidades jsonb default '[]'::jsonb,
  caracteristicas jsonb default '[]'::jsonb,
  galeria jsonb default '[]'::jsonb,
  videos jsonb default '[]'::jsonb,
  estado text default 'Disponible',
  enlace_whatsapp text,
  mapa_url text,
  latitud text,
  longitud text,
  seo_titulo text,
  seo_descripcion text,
  seo_keywords jsonb default '[]'::jsonb,
  visible boolean default true,
  destacado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists proyectos_legacy_id_uidx
  on public.proyectos (legacy_id)
  where legacy_id is not null;

create unique index if not exists proyectos_slug_uidx
  on public.proyectos (slug)
  where slug is not null;

create index if not exists proyectos_estado_idx on public.proyectos (estado);
create index if not exists proyectos_tipo_idx on public.proyectos (tipo);
create index if not exists proyectos_visible_idx on public.proyectos (visible);
create index if not exists proyectos_destacado_idx on public.proyectos (destacado);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists proyectos_set_updated_at on public.proyectos;
create trigger proyectos_set_updated_at
before update on public.proyectos
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proyectos',
  'proyectos',
  true,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.proyectos enable row level security;

drop policy if exists proyectos_public_select_visible on public.proyectos;
create policy proyectos_public_select_visible on public.proyectos
for select to anon
using (visible = true);

drop policy if exists proyectos_authenticated_select on public.proyectos;
create policy proyectos_authenticated_select on public.proyectos
for select to authenticated
using (true);

drop policy if exists proyectos_authenticated_insert on public.proyectos;
create policy proyectos_authenticated_insert on public.proyectos
for insert to authenticated
with check (true);

drop policy if exists proyectos_authenticated_update on public.proyectos;
create policy proyectos_authenticated_update on public.proyectos
for update to authenticated
using (true)
with check (true);

drop policy if exists proyectos_authenticated_delete on public.proyectos;
create policy proyectos_authenticated_delete on public.proyectos
for delete to authenticated
using (true);

drop policy if exists proyectos_storage_public_read on storage.objects;
create policy proyectos_storage_public_read on storage.objects
for select to anon
using (bucket_id = 'proyectos');

drop policy if exists proyectos_storage_authenticated_read on storage.objects;
create policy proyectos_storage_authenticated_read on storage.objects
for select to authenticated
using (bucket_id = 'proyectos');

drop policy if exists proyectos_storage_authenticated_insert on storage.objects;
create policy proyectos_storage_authenticated_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'proyectos');

drop policy if exists proyectos_storage_authenticated_update on storage.objects;
create policy proyectos_storage_authenticated_update on storage.objects
for update to authenticated
using (bucket_id = 'proyectos')
with check (bucket_id = 'proyectos');

drop policy if exists proyectos_storage_authenticated_delete on storage.objects;
create policy proyectos_storage_authenticated_delete on storage.objects
for delete to authenticated
using (bucket_id = 'proyectos');

notify pgrst, 'reload schema';
