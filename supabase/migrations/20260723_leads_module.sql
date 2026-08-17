create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'contacto',
  pagina text,
  origen_url text,
  nombre text,
  email text,
  telefono text,
  interes text,
  mensaje text,
  datos jsonb not null default '{}'::jsonb,
  archivos jsonb not null default '[]'::jsonb,
  estado text not null default 'Nuevo' check (estado in ('Nuevo', 'En proceso', 'Atendida', 'Descartada')),
  notas_admin text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists solicitudes_tipo_idx on public.solicitudes (tipo);
create index if not exists solicitudes_estado_idx on public.solicitudes (estado);
create index if not exists solicitudes_created_at_idx on public.solicitudes (created_at);
create index if not exists solicitudes_email_idx on public.solicitudes (email);
create index if not exists solicitudes_telefono_idx on public.solicitudes (telefono);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists solicitudes_set_updated_at on public.solicitudes;
create trigger solicitudes_set_updated_at
before update on public.solicitudes
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'solicitudes',
  'solicitudes',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.solicitudes enable row level security;

drop policy if exists solicitudes_anon_insert on public.solicitudes;
create policy solicitudes_anon_insert on public.solicitudes
for insert to anon
with check (true);

drop policy if exists solicitudes_authenticated_select on public.solicitudes;
create policy solicitudes_authenticated_select on public.solicitudes
for select to authenticated
using (true);

drop policy if exists solicitudes_authenticated_insert on public.solicitudes;
create policy solicitudes_authenticated_insert on public.solicitudes
for insert to authenticated
with check (true);

drop policy if exists solicitudes_authenticated_update on public.solicitudes;
create policy solicitudes_authenticated_update on public.solicitudes
for update to authenticated
using (true)
with check (true);

drop policy if exists solicitudes_authenticated_delete on public.solicitudes;
create policy solicitudes_authenticated_delete on public.solicitudes
for delete to authenticated
using (true);

drop policy if exists solicitudes_storage_anon_insert on storage.objects;
create policy solicitudes_storage_anon_insert on storage.objects
for insert to anon
with check (bucket_id = 'solicitudes');

drop policy if exists solicitudes_storage_authenticated_read on storage.objects;
create policy solicitudes_storage_authenticated_read on storage.objects
for select to authenticated
using (bucket_id = 'solicitudes');

drop policy if exists solicitudes_storage_authenticated_insert on storage.objects;
create policy solicitudes_storage_authenticated_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'solicitudes');

drop policy if exists solicitudes_storage_authenticated_update on storage.objects;
create policy solicitudes_storage_authenticated_update on storage.objects
for update to authenticated
using (bucket_id = 'solicitudes')
with check (bucket_id = 'solicitudes');

drop policy if exists solicitudes_storage_authenticated_delete on storage.objects;
create policy solicitudes_storage_authenticated_delete on storage.objects
for delete to authenticated
using (bucket_id = 'solicitudes');

notify pgrst, 'reload schema';
