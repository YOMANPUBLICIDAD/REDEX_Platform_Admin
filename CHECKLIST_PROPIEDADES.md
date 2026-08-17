# CHECKLIST PROPIEDADES

Fecha de revisión: 2026-07-22

Estado general: ⚠ pendiente de validación en Supabase real

## Módulo administrativo

| # | Revisión | Estado | Resultado |
|---|---|---|---|
| 1 | Login | ✓ completado | `admin/login.html` usa Supabase Auth con correo y contraseña. |
| 2 | Logout | ✓ completado | `admin/js/auth.js` cierra sesión y vuelve a `login.html`. |
| 3 | Protección de rutas | ✓ completado | `dashboard.html` redirige si falta sesión o configuración. |
| 4 | Dashboard | ✓ completado | Muestra total, disponibles, reservadas, vendidas y acceso a propiedades. |
| 5 | CRUD completo | ✓ completado | Listar, crear, editar, eliminar, duplicar y cambiar banderas están implementados. |
| 6 | Crear propiedad | ✓ completado | El formulario crea registros en `propiedades`. |
| 7 | Editar propiedad | ✓ completado | El formulario actualiza registros existentes por `id`. |
| 8 | Eliminar propiedad | ✓ completado | Elimina con confirmación previa. |
| 9 | Duplicar propiedad | ✓ completado | Crea copia oculta, sin destacar y con slug nuevo. |
| 10 | Disponible | ✓ completado | Estado soportado en formulario y cambio rápido. |
| 11 | Reservado | ✓ completado | Estado soportado en formulario y cambio rápido. |
| 12 | Vendido | ✓ completado | Estado soportado en formulario y cambio rápido. |
| 13 | Ocultar | ✓ completado | Campo `visible` y acción rápida Mostrar/Ocultar. |
| 14 | Destacar | ✓ completado | Campo `destacado` y acción rápida Destacar/No destacar. |
| 15 | SEO | ✓ completado | Edita título, descripción y palabras clave SEO. |
| 16 | Slug | ✓ completado | Genera slug seguro y permite editarlo. |
| 17 | Mapa | ✓ completado | Edita URL de mapa, latitud y longitud. |
| 18 | Amenidades | ✓ completado | Edita lista de amenidades. |
| 19 | Características | ✓ completado | Edita lista de características. |
| 20 | Galería | ✓ completado | Permite URLs existentes y subida múltiple de imágenes. |
| 21 | Videos | ✓ completado | Permite URLs existentes y subida múltiple de videos. |
| 22 | Imagen de portada | ✓ completado | Permite subir portada y guarda `imagen_portada`. |
| 23 | Subida al bucket `propiedades` | ⚠ pendiente | Código implementado; falta probar subida real con credenciales Supabase. |
| 24 | Vista previa | ✓ completado | Vista previa interna para registros guardados y borradores del formulario. |
| 25 | Validaciones | ✓ completado | Valida campos obligatorios: nombre, slug, tipo y ciudad. |
| 26 | Errores | ✓ completado | Captura errores de Auth, tabla, Storage y guardado. |
| 27 | Mensajes | ✓ completado | Usa mensajes visibles tipo toast para éxito/error. |
| 28 | Responsive | ⚠ pendiente | CSS responsive revisado; falta captura en navegador real porque Playwright/Chrome no está instalado. |
| 29 | Accesibilidad | ✓ completado | Labels, roles de diálogo, `aria-live`, foco inicial, foco contenido y Escape. |
| 30 | Rendimiento | ✓ completado | Sin intervalos, sin listeners repetidos y URLs temporales de vista previa revocadas. |

## Supabase

| Revisión | Estado | Resultado |
|---|---|---|
| Tabla `propiedades` | ⚠ pendiente | SQL preparado con columnas, índices, RLS y políticas; falta ejecutarlo/verificarlo en proyecto Supabase real. |
| Bucket `propiedades` | ⚠ pendiente | SQL crea bucket público y políticas Storage; falta validación real. |
| Imágenes almacenadas correctamente | ⚠ pendiente | Migrador preparado; subida real requiere `SUPABASE_URL` y llave válida. |
| URLs públicas guardadas | ⚠ pendiente | Código usa `getPublicUrl` y migrador genera URLs; falta corrida real. |
| Errores de consola | ⚠ pendiente | Sintaxis JS verificada; falta navegador real con credenciales. |
| Referencias rotas | ✓ completado | HTML/CSS/JS admin sirven correctamente por HTTP local y no hay marcadores de trabajo. |
| Fugas de memoria | ✓ completado | La vista previa revoca URLs temporales y el panel no crea procesos persistentes. |

## Inventario y migración segura

| Revisión | Estado | Resultado |
|---|---|---|
| Inmuebles encontrados | ✓ completado | 148 registros reales normalizados. |
| Proyectos encontrados | ✓ completado | 139 registros revisados como fuente de cruce. |
| Archivos de assets encontrados | ✓ completado | 2,943 archivos detectados en carpetas de imágenes/assets. |
| Archivos únicos preparados para Storage | ✓ completado | 1,503 archivos únicos preparados en dry-run. |
| Propiedades preparadas para migración | ✓ completado | 148 propiedades preparadas. |
| Propiedades migradas | ⚠ pendiente | Dry-run correcto; migración real aún no ejecutada. |
| Errores de migración | ✓ completado | 0 errores en dry-run. |

## Archivos revisados

- `admin/login.html`
- `admin/dashboard.html`
- `admin/css/admin.css`
- `admin/js/supabase-config.js`
- `admin/js/auth.js`
- `admin/js/dashboard.js`
- `scripts/audit-properties.js`
- `scripts/migrate-properties.js`
- `supabase/schema-properties.sql`
- `supabase/migrations/20260722_properties_module.sql`
- `admin/backups/latest-normalized-properties.json`
- `admin/reports/latest-inventory-report.json`
- `admin/reports/latest-migration-dry-run-report.json`

## Resultado de pruebas locales

- ✓ completado: sintaxis JavaScript de `dashboard.js`, `auth.js` y `supabase-config.js`.
- ✓ completado: auditoría de inventario con 148 propiedades y 0 assets faltantes.
- ✓ completado: migración en modo seguro con 148 propiedades preparadas, 1,503 archivos únicos y 0 errores.
- ✓ completado: carga HTTP local de `admin/dashboard.html`.
- ⚠ pendiente: prueba visual real de navegador por falta de motor Playwright/Chrome instalado.
- ⚠ pendiente: prueba real contra Supabase hasta colocar credenciales y ejecutar SQL.

## Riesgos pendientes

- ⚠ pendiente: Las operaciones reales de tabla y bucket dependen de ejecutar el SQL en Supabase y configurar las credenciales.
- ⚠ pendiente: Las políticas RLS actuales permiten CRUD a cualquier usuario autenticado; cuando se cree el módulo Roles deberá restringirse por perfil.
- ⚠ pendiente: La web pública todavía no lee Supabase por decisión de fase, por lo que `index.html`, `inmuebles.html`, `data-inmuebles.js` y `proyectos-data.js` siguen intactos.
