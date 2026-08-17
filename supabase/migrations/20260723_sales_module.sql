create table if not exists public.ventas (
  id uuid primary key default gen_random_uuid(),
  tipo_activo text not null default 'propiedad' check (tipo_activo in ('propiedad', 'proyecto')),
  propiedad_id uuid references public.propiedades(id) on delete set null,
  proyecto_id uuid references public.proyectos(id) on delete set null,
  activo_nombre text not null,
  precio_publicado numeric,
  monto_venta numeric not null default 0,
  moneda text not null default 'DOP',
  fecha_venta date not null default current_date,
  vendido_por text not null default 'empresa' check (vendido_por in ('empresa', 'asesor', 'externo')),
  vendedor_nombre text,
  vendedor_contacto text,
  porcentaje_empresa numeric,
  beneficio_empresa numeric not null default 0,
  porcentaje_vendedor numeric,
  beneficio_vendedor numeric not null default 0,
  impuestos_gastos numeric not null default 0,
  beneficio_neto numeric generated always as (beneficio_empresa - impuestos_gastos) stored,
  estado_liquidacion text not null default 'Pendiente' check (estado_liquidacion in ('Pendiente', 'Parcial', 'Liquidada')),
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint ventas_activo_referencia_chk check (
    (tipo_activo = 'propiedad' and propiedad_id is not null and proyecto_id is null)
    or
    (tipo_activo = 'proyecto' and proyecto_id is not null and propiedad_id is null)
  )
);

create index if not exists ventas_tipo_activo_idx on public.ventas (tipo_activo);
create index if not exists ventas_propiedad_id_idx on public.ventas (propiedad_id);
create index if not exists ventas_proyecto_id_idx on public.ventas (proyecto_id);
create index if not exists ventas_fecha_venta_idx on public.ventas (fecha_venta);
create index if not exists ventas_vendido_por_idx on public.ventas (vendido_por);
create index if not exists ventas_estado_liquidacion_idx on public.ventas (estado_liquidacion);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ventas_set_updated_at on public.ventas;
create trigger ventas_set_updated_at
before update on public.ventas
for each row
execute function public.set_updated_at();

alter table public.ventas enable row level security;

drop policy if exists ventas_authenticated_select on public.ventas;
create policy ventas_authenticated_select on public.ventas
for select to authenticated
using (true);

drop policy if exists ventas_authenticated_insert on public.ventas;
create policy ventas_authenticated_insert on public.ventas
for insert to authenticated
with check (true);

drop policy if exists ventas_authenticated_update on public.ventas;
create policy ventas_authenticated_update on public.ventas
for update to authenticated
using (true)
with check (true);

drop policy if exists ventas_authenticated_delete on public.ventas;
create policy ventas_authenticated_delete on public.ventas
for delete to authenticated
using (true);

notify pgrst, 'reload schema';
