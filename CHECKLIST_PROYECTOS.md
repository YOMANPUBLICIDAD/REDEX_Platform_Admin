# Checklist Modulo Proyectos

## Estado General

- [x] Interfaz agregada al dashboard administrativo sin tocar la web publica.
- [x] Separacion visual por pestanas: Propiedades y Proyectos.
- [x] Configuracion de tabla `proyectos` y bucket `proyectos`.
- [x] SQL de esquema creado en `supabase/migrations/20260722_projects_module.sql`.
- [x] Migrador real creado en `scripts/migrate-projects.js`.
- [x] Bucket `proyectos` creado en Supabase.
- [ ] Tabla `proyectos` pendiente de aplicar en Supabase SQL Editor.
- [ ] Migracion de los 8 proyectos reales pendiente hasta que exista la tabla.

## Funciones Del Panel

- [x] Listado de proyectos.
- [x] Buscar proyectos.
- [x] Filtrar por estado.
- [x] Filtrar por visibilidad.
- [x] Crear proyecto.
- [x] Editar proyecto.
- [x] Eliminar proyecto.
- [x] Duplicar proyecto.
- [x] Cambiar estado: Disponible, Reservado, Vendido, En Construccion.
- [x] Ocultar y mostrar.
- [x] Destacar y quitar destacado.
- [x] Portada.
- [x] Galeria.
- [x] Videos.
- [x] Amenidades.
- [x] Caracteristicas.
- [x] Pills comerciales.
- [x] Mapa.
- [x] WhatsApp.
- [x] SEO.
- [x] Vista previa.
- [x] Manejo de errores.
- [x] Responsive heredado del dashboard.

## Validacion

- [x] `admin/js/dashboard.js` sin errores de sintaxis.
- [x] `scripts/migrate-projects.js` sin errores de sintaxis.
- [x] Servidor local activo en `http://127.0.0.1:4173`.
- [x] Propiedades queda protegido si falta la tabla `proyectos`.
- [x] Migrador evita subir archivos si la tabla `proyectos` no existe.

## Pendiente Para Cierre Productivo

Ejecutar en Supabase SQL Editor:

`supabase/migrations/20260722_projects_module.sql`

Luego ejecutar:

`node scripts/migrate-projects.js`

Resultado esperado:

- 8 proyectos reales migrados.
- Imagen de portada subida por proyecto.
- Galerias subidas al bucket `proyectos`.
- URLs publicas guardadas en la tabla `proyectos`.
