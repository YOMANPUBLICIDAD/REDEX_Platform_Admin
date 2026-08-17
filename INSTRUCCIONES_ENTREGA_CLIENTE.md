# REDEX - Instrucciones De Entrega

## Acceso Al Panel

Panel administrativo:

`https://redex-admin.netlify.app/admin/login.html`

Web publica oficial:

`https://redexinmobiliaria.com`

Panel dentro de una entrega descargada:

`/admin/login.html`

## Crear Usuario Administrador

1. Entrar a Supabase.
2. Abrir Authentication.
3. Ir a Users.
4. Crear un usuario con correo y contraseña.
5. Entregar ese correo y contraseña al administrador de REDEX.

El frontend usa solamente la Publishable Key. No colocar Service Role en archivos publicos.

## Editar Contenido

1. Entrar al panel.
2. Abrir Propiedades o Proyectos.
3. Usar Crear, Editar, Duplicar, Estado, Ocultar, Destacar o Eliminar.
4. Para cambiar portada, subir una nueva imagen o elegir una imagen de la galeria como portada.
5. Para ordenar galeria, usar Subir o Bajar en cada imagen y luego Guardar.
6. Para videos, subir archivos desde el campo Videos o eliminar los existentes y luego Guardar.
7. Para textos, precios, metrajes, ciudades, sectores y WhatsApp, editar los campos del formulario y Guardar.

## Supabase

Proyecto:

`https://uwcxkwwtvvsplcnlncfd.supabase.co`

Tablas usadas:

- `propiedades`
- `proyectos`
- `solicitudes`
- `ventas`
- `ventas_links`
- `ventas_reportadas`
- `asesores`

Buckets usados:

- `propiedades`
- `proyectos`
- `solicitudes`

Archivos de configuracion:

- `admin/js/supabase-config.js`
- `public-supabase-data.js`

## Publicar En Netlify

La web publica ya esta publicada en:

`https://redexinmobiliaria.com`

El CMS ya esta publicado en:

`https://redex-admin.netlify.app`

Si se vuelve a publicar manualmente:

1. Entrar a Netlify.
2. Abrir el sitio correspondiente.
3. Subir la carpeta de entrega completa.
4. Build command: dejar vacio.
5. Publish directory: dejar en la raiz del sitio.
6. Publicar.
7. Probar:
   - `/index.html`
   - `/inmuebles.html`
   - `/proyectos-activos.html?proyecto=vista-del-atlantico`
   - `/admin/login.html`

## Respaldo Local

La web publica intenta leer primero desde Supabase.

Si Supabase no responde, usa automaticamente:

- `data-inmuebles.js`
- `proyectos-data.js`

No borrar esos archivos.
