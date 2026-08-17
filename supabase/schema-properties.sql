create extension if not exists pgcrypto;

create table if not exists public.propiedades (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  source text,
  source_index text,
  slug text unique,
  nombre text not null,
  precio text default 'Consultar',
  moneda text,
  ciudad text default 'Consultar',
  sector text default 'Disponible con asesor',
  tipo text default 'Inmueble',
  estado text default 'Disponible' check (estado in ('Disponible', 'Reservado', 'Vendido')),
  metraje text default 'Consultar',
  habitaciones text default 'Consultar',
  banos text default 'Consultar',
  parqueos text default 'Consultar',
  descripcion text default 'Información pendiente de actualización',
  descripcion_corta text,
  caracteristicas jsonb default '[]'::jsonb,
  amenidades jsonb default '[]'::jsonb,
  observaciones jsonb default '[]'::jsonb,
  forma_pago text,
  imagen_portada text,
  galeria jsonb default '[]'::jsonb,
  videos jsonb default '[]'::jsonb,
  documentos jsonb default '[]'::jsonb,
  whatsapp text,
  mapa_url text,
  latitud text,
  longitud text,
  asesor_id uuid,
  asesor_nombre text,
  asesor_telefono text,
  asesor_email text,
  seo_titulo text,
  seo_descripcion text,
  seo_keywords jsonb default '[]'::jsonb,
  visible boolean default true,
  destacado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists propiedades_estado_idx on public.propiedades (estado);
create index if not exists propiedades_tipo_idx on public.propiedades (tipo);
create index if not exists propiedades_ciudad_idx on public.propiedades (ciudad);
create index if not exists propiedades_visible_idx on public.propiedades (visible);
create index if not exists propiedades_destacado_idx on public.propiedades (destacado);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists propiedades_set_updated_at on public.propiedades;
create trigger propiedades_set_updated_at
before update on public.propiedades
for each row
execute function public.set_updated_at();

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
