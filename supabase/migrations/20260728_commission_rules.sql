alter table public.proyectos
  add column if not exists comision_asesor_porcentaje numeric,
  add column if not exists comision_asesor_monto numeric,
  add column if not exists comision_asesor_notas text;

alter table public.propiedades
  add column if not exists comision_asesor_porcentaje numeric,
  add column if not exists comision_asesor_monto numeric,
  add column if not exists comision_asesor_notas text;

create index if not exists proyectos_comision_asesor_porcentaje_idx
  on public.proyectos (comision_asesor_porcentaje);

create index if not exists propiedades_comision_asesor_porcentaje_idx
  on public.propiedades (comision_asesor_porcentaje);

notify pgrst, 'reload schema';
