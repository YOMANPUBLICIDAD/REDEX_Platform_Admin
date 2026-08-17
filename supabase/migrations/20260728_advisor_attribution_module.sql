create table if not exists public.asesores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nombre text not null,
  slug text not null unique,
  rol text default 'Asesor de Ventas',
  telefono text,
  whatsapp text,
  email text,
  foto_url text,
  bio text,
  ciudad text,
  sector text,
  codigo_referido text unique,
  porcentaje_comision numeric,
  meta_mensual numeric default 0,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'activo', 'suspendido', 'rechazado')),
  visible_publico boolean not null default true,
  aprobado_por uuid references auth.users(id) on delete set null,
  aprobado_at timestamptz,
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists asesores_slug_idx on public.asesores (slug);
create index if not exists asesores_estado_idx on public.asesores (estado);
create index if not exists asesores_user_id_idx on public.asesores (user_id);
create index if not exists asesores_codigo_referido_idx on public.asesores (codigo_referido);

alter table public.solicitudes
  add column if not exists asesor_id uuid references public.asesores(id) on delete set null,
  add column if not exists asesor_slug text,
  add column if not exists asesor_nombre text,
  add column if not exists atribucion_fuente text,
  add column if not exists atribucion_activa_hasta timestamptz,
  add column if not exists primer_origen_url text,
  add column if not exists ultima_actividad_url text,
  add column if not exists redex_session_id text;

create index if not exists solicitudes_asesor_id_idx on public.solicitudes (asesor_id);
create index if not exists solicitudes_asesor_slug_idx on public.solicitudes (asesor_slug);
create index if not exists solicitudes_redex_session_id_idx on public.solicitudes (redex_session_id);

create table if not exists public.asesor_tracking_eventos (
  id uuid primary key default gen_random_uuid(),
  asesor_id uuid references public.asesores(id) on delete set null,
  asesor_slug text,
  redex_session_id text,
  evento text not null default 'visita' check (evento in ('visita', 'click_whatsapp', 'formulario', 'ver_propiedad', 'ver_proyecto', 'compartir', 'otro')),
  pagina text,
  origen_url text,
  activo_tipo text check (activo_tipo in ('propiedad', 'proyecto')),
  propiedad_id uuid references public.propiedades(id) on delete set null,
  proyecto_id uuid references public.proyectos(id) on delete set null,
  activo_nombre text,
  cliente_nombre text,
  cliente_email text,
  cliente_telefono text,
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists asesor_tracking_eventos_asesor_id_idx on public.asesor_tracking_eventos (asesor_id);
create index if not exists asesor_tracking_eventos_asesor_slug_idx on public.asesor_tracking_eventos (asesor_slug);
create index if not exists asesor_tracking_eventos_session_idx on public.asesor_tracking_eventos (redex_session_id);
create index if not exists asesor_tracking_eventos_evento_idx on public.asesor_tracking_eventos (evento);
create index if not exists asesor_tracking_eventos_created_at_idx on public.asesor_tracking_eventos (created_at);

alter table public.ventas
  add column if not exists asesor_id uuid references public.asesores(id) on delete set null,
  add column if not exists asesor_slug text,
  add column if not exists solicitud_id uuid references public.solicitudes(id) on delete set null,
  add column if not exists atribucion_fuente text;

create index if not exists ventas_asesor_id_idx on public.ventas (asesor_id);
create index if not exists ventas_asesor_slug_idx on public.ventas (asesor_slug);
create index if not exists ventas_solicitud_id_idx on public.ventas (solicitud_id);

alter table public.ventas_links
  add column if not exists asesor_id uuid references public.asesores(id) on delete set null,
  add column if not exists asesor_slug text,
  add column if not exists asesor_nombre text;

create index if not exists ventas_links_asesor_id_idx on public.ventas_links (asesor_id);
create index if not exists ventas_links_asesor_slug_idx on public.ventas_links (asesor_slug);

alter table public.ventas_reportadas
  add column if not exists asesor_id uuid references public.asesores(id) on delete set null,
  add column if not exists asesor_slug text,
  add column if not exists solicitud_id uuid references public.solicitudes(id) on delete set null;

create index if not exists ventas_reportadas_asesor_id_idx on public.ventas_reportadas (asesor_id);
create index if not exists ventas_reportadas_asesor_slug_idx on public.ventas_reportadas (asesor_slug);
create index if not exists ventas_reportadas_solicitud_id_idx on public.ventas_reportadas (solicitud_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists asesores_set_updated_at on public.asesores;
create trigger asesores_set_updated_at
before update on public.asesores
for each row
execute function public.set_updated_at();

alter table public.asesores enable row level security;
alter table public.asesor_tracking_eventos enable row level security;

drop policy if exists asesores_public_select_activos on public.asesores;
create policy asesores_public_select_activos on public.asesores
for select to anon
using (estado = 'activo' and visible_publico = true);

drop policy if exists asesores_authenticated_select on public.asesores;
create policy asesores_authenticated_select on public.asesores
for select to authenticated
using (true);

drop policy if exists asesores_authenticated_insert on public.asesores;
create policy asesores_authenticated_insert on public.asesores
for insert to authenticated
with check (true);

drop policy if exists asesores_authenticated_update on public.asesores;
create policy asesores_authenticated_update on public.asesores
for update to authenticated
using (true)
with check (true);

drop policy if exists asesores_authenticated_delete on public.asesores;
create policy asesores_authenticated_delete on public.asesores
for delete to authenticated
using (true);

drop policy if exists asesor_tracking_anon_insert on public.asesor_tracking_eventos;
create policy asesor_tracking_anon_insert on public.asesor_tracking_eventos
for insert to anon
with check (true);

drop policy if exists asesor_tracking_authenticated_select on public.asesor_tracking_eventos;
create policy asesor_tracking_authenticated_select on public.asesor_tracking_eventos
for select to authenticated
using (true);

drop policy if exists asesor_tracking_authenticated_insert on public.asesor_tracking_eventos;
create policy asesor_tracking_authenticated_insert on public.asesor_tracking_eventos
for insert to authenticated
with check (true);

drop policy if exists asesor_tracking_authenticated_update on public.asesor_tracking_eventos;
create policy asesor_tracking_authenticated_update on public.asesor_tracking_eventos
for update to authenticated
using (true)
with check (true);

drop policy if exists asesor_tracking_authenticated_delete on public.asesor_tracking_eventos;
create policy asesor_tracking_authenticated_delete on public.asesor_tracking_eventos
for delete to authenticated
using (true);

create or replace view public.v_asesores_resumen_mensual as
select
  a.id as asesor_id,
  a.slug as asesor_slug,
  a.nombre as asesor_nombre,
  a.foto_url,
  date_trunc('month', coalesce(v.fecha_venta, current_date))::date as mes,
  count(v.id) filter (where v.id is not null) as ventas_total,
  coalesce(sum(v.monto_venta), 0) as monto_vendido,
  coalesce(sum(v.beneficio_vendedor), 0) as comision_total,
  count(s.id) as leads_total
from public.asesores a
left join public.ventas v
  on v.asesor_id = a.id
  or (v.asesor_slug is not null and v.asesor_slug = a.slug)
left join public.solicitudes s
  on s.asesor_id = a.id
  or (s.asesor_slug is not null and s.asesor_slug = a.slug)
where a.estado = 'activo'
group by a.id, a.slug, a.nombre, a.foto_url, date_trunc('month', coalesce(v.fecha_venta, current_date));

grant select on public.v_asesores_resumen_mensual to authenticated;

notify pgrst, 'reload schema';
