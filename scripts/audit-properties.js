const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(ROOT, 'admin', 'backups');
const REPORT_DIR = path.join(ROOT, 'admin', 'reports');
const DATA_FILES = ['data-inmuebles.js', 'proyectos-data.js'];
const ASSET_ROOTS = ['images/inmuebles', 'images/proyectos', 'assets/inmuebles'];
const ORIGINAL_PREFIX = 'INMUEBLES EN ';
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic']);
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.avi']);
const DOC_EXT = new Set(['.pdf', '.docx', '.doc', '.xlsx', '.txt', '.rtf']);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readDataFile(file) {
  const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${code}; this.__data = typeof inmueblesData !== "undefined" ? inmueblesData : proyectosData;`, context);
  return context.__data;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile()) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function slugify(value) {
  return String(value || 'propiedad')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'propiedad';
}

function cleanText(value, fallback = 'Consultar') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function normalizeStatus(value) {
  const text = cleanText(value, 'Disponible').toLowerCase();
  if (text.includes('vend')) return 'Vendido';
  if (text.includes('reserv')) return 'Reservado';
  return 'Disponible';
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => cleanText(item, '')).filter(Boolean);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function resolveAsset(rawPath) {
  if (!rawPath) return null;
  const normalized = String(rawPath).replace(/^\.?\//, '');
  const candidates = [
    normalized,
    `images/inmuebles/${normalized}`,
    `images/proyectos/${normalized}`,
    `assets/inmuebles/${normalized}`
  ];
  return candidates.find(candidate => fs.existsSync(path.join(ROOT, candidate))) || normalized;
}

function classifyFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (IMAGE_EXT.has(ext)) return 'image';
  if (VIDEO_EXT.has(ext)) return 'video';
  if (DOC_EXT.has(ext)) return 'document';
  return 'other';
}

function hashFile(file) {
  const hash = crypto.createHash('sha1');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function makePropertyFromInmueble(item, sourceIndex) {
  const portada = resolveAsset(item.imagenPrincipal);
  const galeria = unique([portada, ...normalizeArray(item.galeria).map(resolveAsset)]);
  const detalles = item.detalles || {};

  return {
    legacy_id: String(item.id),
    source: 'data-inmuebles.js',
    source_index: sourceIndex,
    slug: slugify(`${item.id}-${item.nombre}`),
    nombre: cleanText(item.nombre, 'Información pendiente de actualización'),
    precio: cleanText(item.precio),
    moneda: '',
    ciudad: cleanText(item.ciudad),
    sector: cleanText(item.sector, 'Disponible con asesor'),
    tipo: cleanText(item.tipo, 'Inmueble'),
    estado: normalizeStatus(item.estado),
    metraje: cleanText(item.metros),
    habitaciones: cleanText(item.habitaciones),
    banos: cleanText(item.banos),
    parqueos: cleanText(item.parqueos),
    descripcion: cleanText(item.descripcion, cleanText(detalles.desc_corta, 'Información pendiente de actualización')),
    descripcion_corta: cleanText(detalles.desc_corta, ''),
    caracteristicas: unique([
      ...normalizeArray(detalles.distribucion),
      ...normalizeArray(detalles.caracteristicas)
    ]),
    amenidades: unique([
      ...normalizeArray(item.amenidades),
      ...normalizeArray(detalles.amenidades),
      ...normalizeArray(detalles.terminaciones)
    ]),
    observaciones: normalizeArray(detalles.observaciones),
    forma_pago: cleanText(item.forma_pago, ''),
    imagen_portada: portada || '',
    galeria,
    videos: [],
    documentos: [],
    visible: true,
    destacado: false,
    mapa_url: '',
    latitud: '',
    longitud: '',
    asesor_id: '',
    asesor_nombre: '',
    asesor_telefono: '',
    asesor_email: '',
    seo_titulo: cleanText(item.nombre, ''),
    seo_descripcion: cleanText(item.descripcion, ''),
    seo_keywords: unique([item.tipo, item.ciudad, item.sector].map(value => cleanText(value, '')).filter(Boolean)),
    whatsapp: cleanText(item.whatsapp, ''),
    raw: item
  };
}

function makeProjectSignature(item) {
  return slugify(item.slug || item.nombre);
}

function buildOriginalFolderIndex(originalFiles) {
  const index = new Map();
  for (const file of originalFiles) {
    const relative = rel(file);
    const parts = relative.split('/');
    if (parts.length < 3) continue;
    const key = slugify(parts.slice(0, 2).join(' '));
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(relative);
  }
  return index;
}

function attachOriginalFiles(properties, originalFiles) {
  const byFolder = buildOriginalFolderIndex(originalFiles);
  for (const property of properties) {
    const directKey = slugify(`${property.ciudad} ${property.nombre}`);
    const nameKey = slugify(property.nombre);
    const matches = [];
    for (const [folderKey, files] of byFolder.entries()) {
      if (folderKey.includes(nameKey) || directKey.includes(folderKey) || folderKey.includes(directKey)) {
        matches.push(...files);
      }
    }

    const currentMedia = new Set([...property.galeria, ...property.videos, ...property.documentos]);
    for (const file of matches) {
      if (currentMedia.has(file)) continue;
      const kind = classifyFile(file);
      if (kind === 'video') property.videos.push(file);
      if (kind === 'document') property.documentos.push(file);
    }
  }
}

function completeness(property) {
  const required = ['nombre', 'precio', 'ciudad', 'sector', 'tipo', 'estado', 'descripcion', 'imagen_portada'];
  const missing = required.filter(key => {
    const value = property[key];
    return !value || ['Consultar', 'Disponible con asesor', 'Información pendiente de actualización'].includes(value);
  });
  return {
    complete: missing.length === 0,
    missing
  };
}

function main() {
  ensureDir(BACKUP_DIR);
  ensureDir(REPORT_DIR);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const inmuebles = readDataFile('data-inmuebles.js');
  const proyectos = readDataFile('proyectos-data.js');

  for (const file of DATA_FILES) {
    fs.copyFileSync(path.join(ROOT, file), path.join(BACKUP_DIR, `${timestamp}-${file}`));
  }

  const properties = inmuebles.map(makePropertyFromInmueble);
  const projectSignatures = new Set(proyectos.map(makeProjectSignature));
  const propertyNameSignatures = new Set(properties.map(p => slugify(p.nombre)));
  const projectOnly = proyectos.filter(project => {
    const sig = makeProjectSignature(project);
    const nameSig = slugify(project.nombre);
    return !propertyNameSignatures.has(sig) && !propertyNameSignatures.has(nameSig);
  });

  for (const project of projectOnly) {
    const portada = resolveAsset(project.imagenPrincipal);
    properties.push({
      legacy_id: `project-${project.id}`,
      source: 'proyectos-data.js',
      source_index: project.id,
      slug: slugify(project.slug || `${project.id}-${project.nombre}`),
      nombre: cleanText(project.nombre, 'Información pendiente de actualización'),
      precio: cleanText(project.precio),
      moneda: '',
      ciudad: cleanText(project.ubicacion, 'Disponible con asesor'),
      sector: cleanText(project.cantidadDisponible, 'Disponible con asesor'),
      tipo: cleanText(project.tipo, 'Proyecto Residencial'),
      estado: normalizeStatus(project.estado),
      metraje: 'Consultar',
      habitaciones: 'Consultar',
      banos: 'Consultar',
      parqueos: 'Consultar',
      descripcion: cleanText(project.descripcion, 'Información pendiente de actualización'),
      descripcion_corta: cleanText(project.descripcion, ''),
      caracteristicas: normalizeArray(project.pills),
      amenidades: normalizeArray(project.amenidades),
      observaciones: [],
      forma_pago: cleanText(project.reserva, ''),
      imagen_portada: portada || '',
      galeria: unique([portada, ...normalizeArray(project.galeria).map(resolveAsset)]),
      videos: [],
      documentos: [],
      visible: true,
      destacado: false,
      mapa_url: '',
      latitud: '',
      longitud: '',
      asesor_id: '',
      asesor_nombre: '',
      asesor_telefono: '',
      asesor_email: '',
      seo_titulo: cleanText(project.nombre, ''),
      seo_descripcion: cleanText(project.descripcion, ''),
      seo_keywords: unique([project.tipo, project.ubicacion, project.categoriaFiltro].map(value => cleanText(value, '')).filter(Boolean)),
      whatsapp: cleanText(project.enlaceWhatsApp, ''),
      raw: project
    });
  }

  const assetFiles = ASSET_ROOTS.flatMap(root => walk(path.join(ROOT, root)));
  const originalFiles = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith(ORIGINAL_PREFIX))
    .flatMap(entry => walk(path.join(ROOT, entry.name)));

  attachOriginalFiles(properties, originalFiles);

  const referenced = new Set(properties.flatMap(p => [p.imagen_portada, ...p.galeria, ...p.videos, ...p.documentos]).filter(Boolean));
  const missingAssets = [...referenced].filter(file => !fs.existsSync(path.join(ROOT, file)));

  const hashGroups = {};
  for (const file of assetFiles) {
    const kind = classifyFile(file);
    if (kind !== 'image' && kind !== 'video') continue;
    const hash = hashFile(file);
    if (!hashGroups[hash]) hashGroups[hash] = [];
    hashGroups[hash].push(rel(file));
  }
  const duplicateFiles = Object.entries(hashGroups)
    .filter(([, files]) => files.length > 1)
    .map(([hash, files]) => ({ hash, files }));

  const duplicateProperties = [];
  const seenNames = new Map();
  for (const property of properties) {
    const key = slugify(property.nombre);
    if (seenNames.has(key)) duplicateProperties.push({ key, properties: [seenNames.get(key), property.legacy_id] });
    else seenNames.set(key, property.legacy_id);
  }

  const withCompleteness = properties.map(property => ({
    ...property,
    completeness: completeness(property)
  }));

  const report = {
    generated_at: new Date().toISOString(),
    sources: [
      'data-inmuebles.js',
      'proyectos-data.js',
      'inmuebles.html',
      'index.html',
      'proyectos-activos.html',
      'images/inmuebles/',
      'images/proyectos/',
      'assets/inmuebles/',
      'INMUEBLES EN */'
    ],
    counts: {
      inmuebles_in_data_inmuebles: inmuebles.length,
      proyectos_in_proyectos_data: proyectos.length,
      project_signatures: projectSignatures.size,
      project_only_added: projectOnly.length,
      normalized_properties: properties.length,
      asset_files: assetFiles.length,
      original_source_files: originalFiles.length,
      referenced_media: referenced.size,
      missing_assets: missingAssets.length,
      duplicate_file_groups: duplicateFiles.length,
      duplicate_property_names: duplicateProperties.length,
      complete_properties: withCompleteness.filter(p => p.completeness.complete).length,
      partial_properties: withCompleteness.filter(p => !p.completeness.complete).length
    },
    missing_assets: missingAssets,
    duplicate_files: duplicateFiles,
    duplicate_properties: duplicateProperties,
    project_only_added: projectOnly.map(p => ({ id: p.id, slug: p.slug, nombre: p.nombre })),
    partial_properties: withCompleteness
      .filter(p => !p.completeness.complete)
      .map(p => ({ legacy_id: p.legacy_id, nombre: p.nombre, missing: p.completeness.missing }))
  };

  fs.writeFileSync(path.join(BACKUP_DIR, `${timestamp}-normalized-properties.json`), JSON.stringify(withCompleteness, null, 2));
  fs.writeFileSync(path.join(BACKUP_DIR, 'latest-normalized-properties.json'), JSON.stringify(withCompleteness, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, `${timestamp}-inventory-report.json`), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, 'latest-inventory-report.json'), JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report.counts, null, 2));
}

main();
