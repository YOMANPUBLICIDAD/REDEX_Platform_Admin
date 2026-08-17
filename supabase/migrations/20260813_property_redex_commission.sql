alter table public.propiedades
  add column if not exists comision_redex_porcentaje numeric;

create index if not exists propiedades_comision_redex_porcentaje_idx
  on public.propiedades (comision_redex_porcentaje);
