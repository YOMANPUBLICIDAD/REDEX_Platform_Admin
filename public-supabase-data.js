(function () {
  var SUPABASE_URL = 'https://uwcxkwwtvvsplcnlncfd.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZeMpdNfPRtxuALkJgnQf3g_G1xm50Th';
  var TABLE = 'propiedades';
  var PROJECTS_TABLE = 'proyectos';
  var SOURCE = 'fallback';

  var localInmuebles = Array.isArray(window.inmueblesData) ? window.inmueblesData.slice() : (typeof inmueblesData !== 'undefined' ? inmueblesData.slice() : []);
  var localProyectos = Array.isArray(window.proyectosData) ? window.proyectosData.slice() : (typeof proyectosData !== 'undefined' ? proyectosData.slice() : []);

  function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        var parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (_) {
        return value.split('\n').map(function (item) { return item.trim(); }).filter(Boolean);
      }
    }
    return [];
  }

  function normalizeText(value, fallback) {
    var text = String(value == null ? '' : value).trim();
    return text || fallback || '';
  }

  function findLocal(row) {
    var keys = [row.legacy_id, row.slug, row.id, row.nombre].filter(Boolean).map(String);
    return localInmuebles.find(function (item) {
      return keys.indexOf(String(item.id)) !== -1 || keys.indexOf(String(item.slug)) !== -1 || keys.indexOf(String(item.nombre)) !== -1;
    }) || {};
  }

  function money(row, local) {
    if (row.precio === null || row.precio === undefined || row.precio === '') return local.precio || 'Consultar';
    var number = Number(row.precio);
    if (!Number.isFinite(number) || number <= 0) return local.precio || 'Consultar';
    var currency = normalizeText(row.moneda, 'DOP').toUpperCase();
    var prefix = currency === 'USD' ? 'USD $' : 'RD$';
    return prefix + new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(number);
  }

  function metric(value, suffix, fallback) {
    if (value === null || value === undefined || value === '') return fallback || 'Consultar';
    var number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return fallback || 'Consultar';
    return suffix ? new Intl.NumberFormat('es-DO').format(number) + ' ' + suffix : String(number);
  }

  function whatsapp(nombre, local) {
    if (local.whatsapp) return local.whatsapp;
    return 'https://wa.me/18495180024?text=Hola,%20me%20interesa%20obtener%20más%20información%20sobre%20' + encodeURIComponent(nombre || 'esta propiedad');
  }

  function normalizeProperty(row, index) {
    var local = findLocal(row);
    var nombre = normalizeText(row.nombre, local.nombre || 'Propiedad REDEX');
    var caracteristicas = asArray(row.caracteristicas).length ? asArray(row.caracteristicas) : asArray(local.detalles && local.detalles.caracteristicas);
    var amenidades = asArray(row.amenidades).length ? asArray(row.amenidades) : asArray(local.amenidades || (local.detalles && local.detalles.amenidades));
    var observaciones = asArray(row.observaciones).length ? asArray(row.observaciones) : asArray(local.detalles && local.detalles.observaciones);
    var galeria = asArray(row.galeria).length ? asArray(row.galeria) : asArray(local.galeria);
    var imagenPrincipal = normalizeText(row.imagen_portada, local.imagenPrincipal || galeria[0] || 'hero_bg.png');
    var descripcion = normalizeText(row.descripcion, local.descripcion || 'Propiedad disponible con asesor REDEX.');

    return {
      id: normalizeText(row.legacy_id, row.slug || row.id || local.id || index + 1),
      slug: normalizeText(row.slug, local.slug || row.legacy_id || row.id || ''),
      nombre: nombre,
      precio: money(row, local),
      tipo: normalizeText(row.tipo, local.tipo || 'Inmueble'),
      ciudad: normalizeText(row.ciudad, local.ciudad || 'República Dominicana'),
      sector: normalizeText(row.sector, local.sector || 'Disponible con asesor'),
      estado: normalizeText(row.estado, local.estado || 'Disponible'),
      imagenPrincipal: imagenPrincipal,
      descripcion: descripcion,
      metros: metric(row.metraje, 'm²', local.metros),
      habitaciones: metric(row.habitaciones, '', local.habitaciones),
      banos: metric(row.banos, '', local.banos),
      parqueos: metric(row.parqueos, '', local.parqueos),
      forma_pago: normalizeText(row.forma_pago, local.forma_pago || 'Consultar'),
      galeria: galeria,
      videos: asArray(row.videos).length ? asArray(row.videos) : asArray(local.videos),
      amenidades: amenidades,
      whatsapp: whatsapp(nombre, local),
      detalles: {
        desc_corta: normalizeText(row.descripcion_corta, (local.detalles && local.detalles.desc_corta) || descripcion),
        distribucion: asArray(local.detalles && local.detalles.distribucion),
        caracteristicas: caracteristicas,
        amenidades: amenidades,
        terminaciones: asArray(local.detalles && local.detalles.terminaciones),
        observaciones: observaciones
      },
      visible: row.visible !== false,
      destacado: row.destacado === true
    };
  }

  function projectCategory(item) {
    var type = String(item.tipo || '').toLowerCase();
    if (type.indexOf('solar') !== -1 || type.indexOf('lote') !== -1 || type.indexOf('lotificaci') !== -1 || type.indexOf('terreno') !== -1) return 'lote';
    return 'inmueble';
  }

  function normalizeProject(item, index) {
    var local = localProyectos.find(function (project) {
      return String(project.slug) === String(item.slug) || String(project.id) === String(item.id) || String(project.nombre) === String(item.nombre);
    }) || {};
    var categoriaFiltro = local.categoriaFiltro || projectCategory(item);
    return {
      id: item.id || local.id || index + 1,
      slug: item.slug || local.slug || item.id,
      nombre: item.nombre,
      imagenPrincipal: item.imagenPrincipal,
      etiqueta: item.estado || 'Disponible',
      colorEtiqueta: item.estado === 'Disponible' ? 'green' : 'red',
      pills: local.pills || [item.tipo, item.ciudad, item.sector].filter(Boolean).slice(0, 3),
      galeria: item.galeria || [],
      amenidades: item.amenidades || [],
      estado: item.estado || 'Disponible',
      enlaceWhatsApp: item.whatsapp,
      categoriaFiltro: categoriaFiltro,
      cantidadDisponible: local.cantidadDisponible || (item.estado || 'Disponible'),
      ubicacion: [item.ciudad, item.sector].filter(Boolean).join(', '),
      precio: item.precio || 'Consultar',
      reserva: local.reserva || '',
      descripcion: item.descripcion || ''
    };
  }

  function findLocalProject(row) {
    var legacyNumber = String(row.legacy_id || '').replace(/^proyecto-/, '');
    var keys = [row.legacy_id, legacyNumber, row.slug, row.id, row.nombre].filter(Boolean).map(String);
    return localProyectos.find(function (project) {
      return keys.indexOf(String(project.id)) !== -1 || keys.indexOf(String(project.slug)) !== -1 || keys.indexOf(String(project.nombre)) !== -1;
    }) || {};
  }

  function normalizeSupabaseProject(row, index) {
    var local = findLocalProject(row);
    return {
      id: local.id || row.legacy_id || row.id || index + 1,
      slug: normalizeText(row.slug, local.slug || row.legacy_id || row.id || ''),
      nombre: normalizeText(row.nombre, local.nombre || 'Proyecto REDEX'),
      ubicacion: normalizeText(row.ubicacion, local.ubicacion || [row.ciudad, row.sector].filter(Boolean).join(', ') || 'República Dominicana'),
      tipo: normalizeText(row.tipo, local.tipo || 'proyecto'),
      categoriaFiltro: normalizeText(row.categoria_filtro, local.categoriaFiltro || projectCategory(row)),
      cantidadDisponible: normalizeText(row.cantidad_disponible, local.cantidadDisponible || 'Por consultar'),
      precio: normalizeText(row.precio_texto, local.precio || 'Consultar'),
      reserva: normalizeText(row.reserva, local.reserva || 'Consultar'),
      descripcion: normalizeText(row.descripcion, local.descripcion || 'Información pendiente de actualización'),
      imagenPrincipal: normalizeText(row.imagen_portada, local.imagenPrincipal || 'hero_bg.png'),
      etiqueta: normalizeText(row.etiqueta, local.etiqueta || row.estado || 'Disponible'),
      colorEtiqueta: normalizeText(row.color_etiqueta, local.colorEtiqueta || (row.estado === 'Disponible' ? 'green' : 'red')),
      pills: asArray(row.pills).length ? asArray(row.pills) : asArray(local.pills),
      galeria: asArray(row.galeria).length ? asArray(row.galeria) : asArray(local.galeria),
      amenidades: asArray(row.amenidades).length ? asArray(row.amenidades) : asArray(local.amenidades),
      caracteristicas: asArray(row.caracteristicas).length ? asArray(row.caracteristicas) : asArray(local.caracteristicas),
      videos: asArray(row.videos).length ? asArray(row.videos) : asArray(local.videos),
      estado: normalizeText(row.estado, local.estado || 'Disponible'),
      enlaceWhatsApp: normalizeText(row.enlace_whatsapp, local.enlaceWhatsApp || whatsapp(row.nombre, local)),
      visible: row.visible !== false,
      destacado: row.destacado === true
    };
  }

  function fetchRows() {
    var xhr = new XMLHttpRequest();
    var columns = [
      'id', 'legacy_id', 'source', 'source_index', 'slug', 'nombre', 'precio', 'moneda', 'ciudad', 'sector', 'tipo', 'estado',
      'metraje', 'habitaciones', 'banos', 'parqueos', 'descripcion', 'descripcion_corta', 'caracteristicas', 'amenidades',
      'observaciones', 'forma_pago', 'imagen_portada', 'galeria', 'videos', 'whatsapp', 'visible', 'destacado'
    ].join(',');
    var url = SUPABASE_URL + '/rest/v1/' + TABLE + '?select=' + encodeURIComponent(columns) + '&visible=eq.true&order=created_at.asc&limit=500';
    xhr.open('GET', url, false);
    xhr.setRequestHeader('apikey', SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_PUBLISHABLE_KEY);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) throw new Error('Supabase public read failed: ' + xhr.status);
    var rows = JSON.parse(xhr.responseText || '[]');
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('Supabase returned no public properties');
    return rows;
  }

  function fetchProjectRows() {
    var xhr = new XMLHttpRequest();
    var columns = [
      'id', 'legacy_id', 'slug', 'nombre', 'ubicacion', 'ciudad', 'sector', 'tipo', 'categoria_filtro',
      'cantidad_disponible', 'precio_texto', 'reserva', 'descripcion', 'imagen_portada', 'etiqueta',
      'color_etiqueta', 'pills', 'amenidades', 'caracteristicas', 'galeria', 'videos', 'estado',
      'enlace_whatsapp', 'visible', 'destacado'
    ].join(',');
    var url = SUPABASE_URL + '/rest/v1/' + PROJECTS_TABLE + '?select=' + encodeURIComponent(columns) + '&visible=eq.true&order=created_at.asc&limit=100';
    xhr.open('GET', url, false);
    xhr.setRequestHeader('apikey', SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_PUBLISHABLE_KEY);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) throw new Error('Supabase public projects read failed: ' + xhr.status);
    var rows = JSON.parse(xhr.responseText || '[]');
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('Supabase returned no public projects');
    return rows;
  }

  try {
    var rows = fetchRows();
    var mapped = rows.map(normalizeProperty);
    inmueblesData = mapped;
    window.inmueblesData = mapped;
    SOURCE = 'supabase';
  } catch (error) {
    window.inmueblesData = localInmuebles;
    if (typeof inmueblesData !== 'undefined') inmueblesData = localInmuebles;
    SOURCE = 'fallback';
  }

  try {
    var projectRows = fetchProjectRows();
    var mappedProjects = projectRows.map(normalizeSupabaseProject);
    if (typeof proyectosData !== 'undefined') {
      proyectosData = mappedProjects;
      window.proyectosData = proyectosData;
    }
  } catch (error) {
    if (typeof proyectosData !== 'undefined') {
      window.proyectosData = localProyectos;
      proyectosData = localProyectos;
    }
    if (SOURCE === 'supabase') SOURCE = 'supabase-propiedades';
  }

  window.REDEX_PUBLIC_DATA_SOURCE = SOURCE;
})();
