create table if not exists public.ventas_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  tipo_activo text not null check (tipo_activo in ('propiedad', 'proyecto')),
  propiedad_id uuid references public.propiedades(id) on delete cascade,
  proyecto_id uuid references public.proyectos(id) on delete cascade,
  activo_nombre text not null,
  creado_por uuid references auth.users(id) on delete set null,
  activo boolean not null default true,
  usado boolean not null default false,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint ventas_links_activo_referencia_chk check (
    (tipo_activo = 'propiedad' and propiedad_id is not null and proyecto_id is null)
    or
    (tipo_activo = 'proyecto' and proyecto_id is not null and propiedad_id is null)
  )
);

create table if not exists public.ventas_reportadas (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references public.ventas_links(id) on delete set null,
  token text not null,
  tipo_activo text not null check (tipo_activo in ('propiedad', 'proyecto')),
  propiedad_id uuid references public.propiedades(id) on delete set null,
  proyecto_id uuid references public.proyectos(id) on delete set null,
  activo_nombre text not null,
  vendedor_nombre text not null,
  vendedor_telefono text,
  vendedor_correo text,
  cliente_nombre text not null,
  cliente_telefono text not null,
  cliente_correo text,
  cliente_ubicacion text,
  fecha_venta date not null,
  precio_final numeric not null,
  monto_inicial numeric,
  forma_pago text not null default 'contado' check (forma_pago in ('contado', 'prestamo', 'financiamiento')),
  banco_entidad text,
  porcentaje_interes numeric,
  plazo_financiamiento text,
  metraje text,
  ubicacion_inmueble text,
  notas text,
  estado_revision text not null default 'Pendiente' check (estado_revision in ('Pendiente', 'Aprobada', 'Rechazada')),
  venta_id uuid references public.ventas(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists ventas_links_token_idx on public.ventas_links (token);
create index if not exists ventas_links_activo_idx on public.ventas_links (activo);
create index if not exists ventas_reportadas_estado_idx on public.ventas_reportadas (estado_revision);
create index if not exists ventas_reportadas_propiedad_idx on public.ventas_reportadas (propiedad_id);
create index if not exists ventas_reportadas_proyecto_idx on public.ventas_reportadas (proyecto_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ventas_links_set_updated_at on public.ventas_links;
create trigger ventas_links_set_updated_at
before update on public.ventas_links
for each row
execute function public.set_updated_at();

drop trigger if exists ventas_reportadas_set_updated_at on public.ventas_reportadas;
create trigger ventas_reportadas_set_updated_at
before update on public.ventas_reportadas
for each row
execute function public.set_updated_at();

alter table public.ventas_links enable row level security;
alter table public.ventas_reportadas enable row level security;

drop policy if exists ventas_links_authenticated_select on public.ventas_links;
create policy ventas_links_authenticated_select on public.ventas_links
for select to authenticated
using (true);

drop policy if exists ventas_links_authenticated_insert on public.ventas_links;
create policy ventas_links_authenticated_insert on public.ventas_links
for insert to authenticated
with check (true);

drop policy if exists ventas_links_authenticated_update on public.ventas_links;
create policy ventas_links_authenticated_update on public.ventas_links
for update to authenticated
using (true)
with check (true);

drop policy if exists ventas_links_authenticated_delete on public.ventas_links;
create policy ventas_links_authenticated_delete on public.ventas_links
for delete to authenticated
using (true);

drop policy if exists ventas_reportadas_authenticated_select on public.ventas_reportadas;
create policy ventas_reportadas_authenticated_select on public.ventas_reportadas
for select to authenticated
using (true);

drop policy if exists ventas_reportadas_authenticated_update on public.ventas_reportadas;
create policy ventas_reportadas_authenticated_update on public.ventas_reportadas
for update to authenticated
using (true)
with check (true);

drop policy if exists ventas_reportadas_authenticated_delete on public.ventas_reportadas;
create policy ventas_reportadas_authenticated_delete on public.ventas_reportadas
for delete to authenticated
using (true);

create or replace function public.obtener_link_venta(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.ventas_links;
  v_property public.propiedades;
  v_project public.proyectos;
begin
  select *
  into v_link
  from public.ventas_links
  where token = p_token
    and activo = true
    and usado = false
    and expires_at > now()
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Link no disponible');
  end if;

  if v_link.tipo_activo = 'propiedad' then
    select * into v_property from public.propiedades where id = v_link.propiedad_id;
    return jsonb_build_object(
      'ok', true,
      'tipo_activo', v_link.tipo_activo,
      'activo_nombre', v_link.activo_nombre,
      'precio', v_property.precio,
      'metraje', v_property.metraje,
      'ubicacion', trim(coalesce(v_property.ciudad, '') || ' ' || coalesce(v_property.sector, '')),
      'imagen_portada', v_property.imagen_portada
    );
  end if;

  select * into v_project from public.proyectos where id = v_link.proyecto_id;
  return jsonb_build_object(
    'ok', true,
    'tipo_activo', v_link.tipo_activo,
    'activo_nombre', v_link.activo_nombre,
    'precio', v_project.precio_texto,
    'metraje', null,
    'ubicacion', coalesce(v_project.ubicacion, trim(coalesce(v_project.ciudad, '') || ' ' || coalesce(v_project.sector, ''))),
    'imagen_portada', v_project.imagen_portada
  );
end;
$$;

create or replace function public.crear_reporte_venta(
  p_token text,
  p_vendedor_nombre text,
  p_vendedor_telefono text,
  p_vendedor_correo text,
  p_cliente_nombre text,
  p_cliente_telefono text,
  p_cliente_correo text,
  p_cliente_ubicacion text,
  p_fecha_venta date,
  p_precio_final numeric,
  p_monto_inicial numeric,
  p_forma_pago text,
  p_banco_entidad text,
  p_porcentaje_interes numeric,
  p_plazo_financiamiento text,
  p_metraje text,
  p_ubicacion_inmueble text,
  p_notas text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.ventas_links;
  v_report_id uuid;
begin
  select *
  into v_link
  from public.ventas_links
  where token = p_token
    and activo = true
    and usado = false
    and expires_at > now()
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Link no disponible');
  end if;

  if coalesce(trim(p_vendedor_nombre), '') = ''
    or coalesce(trim(p_cliente_nombre), '') = ''
    or coalesce(trim(p_cliente_telefono), '') = ''
    or coalesce(p_precio_final, 0) <= 0 then
    return jsonb_build_object('ok', false, 'message', 'Completa los campos obligatorios');
  end if;

  insert into public.ventas_reportadas (
    link_id,
    token,
    tipo_activo,
    propiedad_id,
    proyecto_id,
    activo_nombre,
    vendedor_nombre,
    vendedor_telefono,
    vendedor_correo,
    cliente_nombre,
    cliente_telefono,
    cliente_correo,
    cliente_ubicacion,
    fecha_venta,
    precio_final,
    monto_inicial,
    forma_pago,
    banco_entidad,
    porcentaje_interes,
    plazo_financiamiento,
    metraje,
    ubicacion_inmueble,
    notas
  )
  values (
    v_link.id,
    p_token,
    v_link.tipo_activo,
    v_link.propiedad_id,
    v_link.proyecto_id,
    v_link.activo_nombre,
    trim(p_vendedor_nombre),
    nullif(trim(coalesce(p_vendedor_telefono, '')), ''),
    nullif(trim(coalesce(p_vendedor_correo, '')), ''),
    trim(p_cliente_nombre),
    trim(p_cliente_telefono),
    nullif(trim(coalesce(p_cliente_correo, '')), ''),
    nullif(trim(coalesce(p_cliente_ubicacion, '')), ''),
    p_fecha_venta,
    p_precio_final,
    p_monto_inicial,
    coalesce(nullif(p_forma_pago, ''), 'contado'),
    nullif(trim(coalesce(p_banco_entidad, '')), ''),
    p_porcentaje_interes,
    nullif(trim(coalesce(p_plazo_financiamiento, '')), ''),
    nullif(trim(coalesce(p_metraje, '')), ''),
    nullif(trim(coalesce(p_ubicacion_inmueble, '')), ''),
    nullif(trim(coalesce(p_notas, '')), '')
  )
  returning id into v_report_id;

  update public.ventas_links
  set usado = true,
      activo = false
  where id = v_link.id;

  return jsonb_build_object('ok', true, 'reporte_id', v_report_id);
end;
$$;

grant execute on function public.obtener_link_venta(text) to anon, authenticated;
grant execute on function public.crear_reporte_venta(text, text, text, text, text, text, text, text, date, numeric, numeric, text, text, numeric, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
